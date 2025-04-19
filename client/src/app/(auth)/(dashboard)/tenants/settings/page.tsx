"use client";
import React from "react";
import {
  useGetAuthUserQuery,
  useUpdateTenantSettingsMutation,
} from "../../../../../../state/api";
import { initialState } from "../../../../../../state";
import SettingsForm from "@/components/app-components/SettingsForm";

const TenantSettings = () => {
  const { data: authUser, isLoading } = useGetAuthUserQuery();
  const [updateTenant] = useUpdateTenantSettingsMutation();
  if (isLoading) return <div>Loading</div>;
  const initialData = {
    name: authUser?.userInfo?.name,
    email: authUser?.userInfo.email,
    phoneNumber: authUser?.userInfo.phoneNumber,
  };
  const handleSubmit = async (data: typeof initialState) => {
    await updateTenant({
      cognitoId: authUser?.cognitoInfo?.userId,
      ...data,
    });
  };

  return (
    <SettingsForm
      initialData={initialData}
      onSubmit={handleSubmit}
      userType="tenant"
    />
  );
};
export default TenantSettings;
