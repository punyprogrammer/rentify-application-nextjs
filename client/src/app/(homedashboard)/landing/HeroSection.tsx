"use client";
import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <div className="relative h-screen">
      <Image
        src="/landing-splash.jpg"
        alt="Rentiful rental platform"
        fill
        className="object-cover object-center"
        priority
      />
      {/* This div is provide opacity */}
      <div className="absolute inset-0 bg-black opacity-60 flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute left-1/2 top-1/2 transform opacity-100  -translate-x-1/2 -translate-y-1/2 text-center w-full"
        >
          <div className="max-w-4xl mx-auto px-16 sm:px-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              Start your journey to find the place to call home
            </h1>
            <p className="text-xl text-white mb-8">
              Explore a wide range of listings tailored to your lifestyles and
              needs
            </p>
            <div className="flex items-center justify-center">
              <Input
                type="text"
                value="search query"
                onChange={() => {}}
                placeholder="Search city,country or neighbouhood"
                className="w-full max-w-lg rounded-none rounded-l-xl border-none bg-white h-12ß"
              />
              <Button
                onClick={() => {}}
                className="bg-secondary-500 rounded-none rounded-r-xl border-none hover:bg-secondary-600 transition duration-200 cursor-pointer"
              >
                Search
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default HeroSection;
