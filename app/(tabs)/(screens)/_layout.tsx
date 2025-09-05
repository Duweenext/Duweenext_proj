import TopBar from "@/src/component/NavBar/TopBar";
import { Slot } from "expo-router";
import React from "react";

export default function Layout() {
  return (
    <>
      <TopBar />
      <Slot />
    </>
  );
}
