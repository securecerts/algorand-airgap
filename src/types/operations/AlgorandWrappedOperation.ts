import { AlgorandOperation } from './kinds/Algorandoperation'

export interface AlgorandWrappedOperation {
  branch: string
  contents: AlgorandOperation[]
}