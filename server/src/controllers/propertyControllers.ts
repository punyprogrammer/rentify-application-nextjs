import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";
import { S3Client } from "@aws-sdk/client-s3";
import { Location } from "@prisma/client";
import { Upload } from "@aws-sdk/lib-storage";
import axios from "axios";

const prisma = new PrismaClient();


// Set up AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

// GET /properties — Returns filtered list of properties
export const getProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Extract filters from query params
    const {
      favoriteIds, priceMin, priceMax, beds, baths, propertyType,
      squareFeetMin, squareFeetMax, amenities, availableFrom,
      latitude, longitude
    } = req.query;

    // Store SQL filter conditions
    let whereConditions: Prisma.Sql[] = [];

    // Filter: favorite property IDs
    if (favoriteIds) {
      const favoriteIdsArray = (favoriteIds as string).split(",").map(Number);
      whereConditions.push(
        Prisma.sql`p.id IN (${Prisma.join(favoriteIdsArray)})`
      );
    }

    // Filter: price range
    if (priceMin) {
      whereConditions.push(Prisma.sql`p."pricePerMonth" >= ${Number(priceMin)}`);
    }

    if (priceMax) {
      whereConditions.push(Prisma.sql`p."pricePerMonth" <= ${Number(priceMax)}`);
    }

    // Filter: number of beds
    if (beds && beds !== "any") {
      whereConditions.push(Prisma.sql`p.beds >= ${Number(beds)}`);
    }

    // Filter: number of baths
    if (baths && baths !== "any") {
      whereConditions.push(Prisma.sql`p.baths >= ${Number(baths)}`);
    }

    // Filter: square footage
    if (squareFeetMin) {
      whereConditions.push(Prisma.sql`p."squareFeet" >= ${Number(squareFeetMin)}`);
    }

    if (squareFeetMax) {
      whereConditions.push(Prisma.sql`p."squareFeet" <= ${Number(squareFeetMax)}`);
    }

    // Filter: property type
    if (propertyType && propertyType !== "any") {
      whereConditions.push(
        Prisma.sql`p."propertyType" = ${propertyType}::"PropertyType"`
      );
    }

    // Filter: amenities array must include specified amenities
    if (amenities && amenities !== "any") {
      const amenitiesArray = (amenities as string).split(",");
      whereConditions.push(Prisma.sql`p.amenities @> ${amenitiesArray}`);
    }

    // Filter: available from a specific date
    if (availableFrom && availableFrom !== "any") {
      const availableFromDate = typeof availableFrom === "string" ? availableFrom : null;
      if (availableFromDate) {
        const date = new Date(availableFromDate);
        if (!isNaN(date.getTime())) {
          whereConditions.push(
            Prisma.sql`EXISTS (
              SELECT 1 FROM "Lease" l 
              WHERE l."propertyId" = p.id 
              AND l."startDate" <= ${date.toISOString()}
            )`
          );
        }
      }
    }

    // Filter: properties within a certain distance from lat/lng
    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      const radiusInKilometers = 1000;
      const degrees = radiusInKilometers / 111; // Convert km to degrees (~111km per 1 degree lat)

      whereConditions.push(
        Prisma.sql`ST_DWithin(
          l.coordinates::geometry,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
          ${degrees}
        )`
      );
    }

    // Construct SQL query to fetch properties and their location data
    const completeQuery = Prisma.sql`
      SELECT 
        p.*,
        json_build_object(
          'id', l.id,
          'address', l.address,
          'city', l.city,
          'state', l.state,
          'country', l.country,
          'postalCode', l."postalCode",
          'coordinates', json_build_object(
            'longitude', ST_X(l."coordinates"::geometry),
            'latitude', ST_Y(l."coordinates"::geometry)
          )
        ) as location
      FROM "Property" p
      JOIN "Location" l ON p."locationId" = l.id
      ${
        whereConditions.length > 0
          ? Prisma.sql`WHERE ${Prisma.join(whereConditions, " AND ")}`
          : Prisma.empty
      }
    `;

    const properties = await prisma.$queryRaw(completeQuery);

    res.json(properties);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving properties: ${error.message}` });
  }
};


export const getProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Get the property with its location using Prisma
    const property = await prisma.property.findUnique({
      where: { id: Number(id) },
      include: {
        location: true,
      },
    });

    if (property) {
      // Retrieve WKT coordinates from the Location table
      const coordinates: { coordinates: string }[] =
        await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;

      // Convert WKT to GeoJSON format
      const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
      const longitude = geoJSON.coordinates[0];
      const latitude = geoJSON.coordinates[1];

      // Construct a new response including parsed coordinates
      const propertyWithCoordinates = {
        ...property,
        location: {
          ...property.location,
          coordinates: {
            longitude,
            latitude,
          },
        },
      };

      res.json(propertyWithCoordinates);
    }
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error retrieving property: ${err.message}` });
  }
};

export const createProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];

    // Extract property and address data from request
    const {
      address, city, state, country, postalCode,
      managerCognitoId, ...propertyData
    } = req.body;

    // Upload images to S3 and return their URLs
    const photoUrls = await Promise.all(
      files.map(async (file) => {
        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: `properties/${Date.now()}-${file.originalname}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        const uploadResult = await new Upload({
          client: s3Client,
          params: uploadParams,
        }).done();

        return uploadResult.Location;
      })
    );

    // Use OpenStreetMap Nominatim to geocode the address
    const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(
      {
        street: address,
        city,
        country,
        postalcode: postalCode,
        format: "json",
        limit: "1",
      }
    ).toString()}`;

    const geocodingResponse = await axios.get(geocodingUrl, {
      headers: {
        "User-Agent": "RealEstateApp (justsomedummyemail@gmail.com",
      },
    });

    // Parse geocoding result
    const [longitude, latitude] =
      geocodingResponse.data[0]?.lon && geocodingResponse.data[0]?.lat
        ? [
            parseFloat(geocodingResponse.data[0]?.lon),
            parseFloat(geocodingResponse.data[0]?.lat),
          ]
        : [0, 0]; // fallback to default

    // Insert location into DB with spatial point
    const [location] = await prisma.$queryRaw<Location[]>`
      INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
      VALUES (${address}, ${city}, ${state}, ${country}, ${postalCode}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326))
      RETURNING id, address, city, state, country, "postalCode", ST_AsText(coordinates) as coordinates;
    `;

    // Create new property with associated location
    const newProperty = await prisma.property.create({
      data: {
        ...propertyData,
        photoUrls,
        locationId: location.id,
        managerCognitoId,
        amenities:
          typeof propertyData.amenities === "string"
            ? propertyData.amenities.split(",")
            : [],
        highlights:
          typeof propertyData.highlights === "string"
            ? propertyData.highlights.split(",")
            : [],
        isPetsAllowed: propertyData.isPetsAllowed === "true",
        isParkingIncluded: propertyData.isParkingIncluded === "true",
        pricePerMonth: parseFloat(propertyData.pricePerMonth),
        securityDeposit: parseFloat(propertyData.securityDeposit),
        applicationFee: parseFloat(propertyData.applicationFee),
        beds: parseInt(propertyData.beds),
        baths: parseFloat(propertyData.baths),
        squareFeet: parseInt(propertyData.squareFeet),
      },
      include: {
        location: true,
        manager: true,
      },
    });

    res.status(201).json(newProperty);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error creating property: ${err.message}` });
  }
};

