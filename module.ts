import { AirGapModule } from '@airgap/module-kit'
import { AlgorandModule } from './module/AlgorandModule'

export * from './index'

export function create(): AirGapModule {
  return new AlgorandModule()
}