import { AirGapModule } from "@airgap/module-kit";
import { MyModule } from "./module.ts";

export function create(): AirGapModule {
  return new MyModule();
}