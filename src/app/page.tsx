import YourParentComponent from "@components/YourParentComponent";
import { Button } from "@styles/Button";
import React from "react";
import YourParentComponent from "@components/YourParentComponent";

export default function Home() {
  return (
    <main>
      <h1>SLO Beaver Brigade</h1>
      <Button>Nice Button</Button>
      <YourParentComponent/>
    </main>
  );
}
