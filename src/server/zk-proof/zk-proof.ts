import fs from 'node:fs/promises';
import path from 'node:path';
import * as snarkjs from 'snarkjs';
import { submitZKProofOnChain } from './zk-verify';

export async function serverZKProof(
  inputData: InputData,
  verifyOnChain: boolean
) {
  const circuitFile = 'circuit/circuit.wasm';
  const provingKeyFile = 'keys/circuit_final.zkey';
  const verificationKeyFile = 'keys/verification_key.json';

  const basePath = process.cwd() + '/src/server/zk-proof/';
  const circuitPath = path.resolve(basePath, circuitFile);
  const provingKeyPath = path.resolve(basePath, provingKeyFile);
  const verificationKeyPath = path.resolve(basePath, verificationKeyFile);

  let proofResp: {
    proof: snarkjs.Groth16Proof;
    publicSignals: snarkjs.PublicSignals;
  };

  try {
    // create proof
    proofResp = await snarkjs.groth16.fullProve(
      inputData,
      circuitPath,
      provingKeyPath
    );
  } catch (err) {
    console.error(err);
    throw new Error('Unable to create proof!');
  }

  const { proof, publicSignals } = proofResp;

  const verificationKey = (await fs.readFile(verificationKeyPath)).toString();
  const vKey = JSON.parse(verificationKey);

  // verify proof
  if (!verifyOnChain) {
    // verify proof on server (locally)
    const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    if (res === true) {
      return true;
    }
    throw new Error('Invalid proof!');
  } else {
    // solidity calldata
    const callDataStr = await snarkjs.groth16.exportSolidityCallData(
      proof,
      publicSignals
    );
    const callDataJson = JSON.parse(`[${callDataStr}]`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callData = deepswapToBigint(callDataJson, true) as any;

    // verify proof on chain
    const [verified, errMsg] = await submitZKProofOnChain({ callData });
    if (verified === true) {
      return true;
    }
    throw new Error(errMsg ?? 'Unable to verify!');
  }
}

function deepswapToBigint(
  calldata: CalldataItem,
  toBigint = false
): CalldataItem {
  return calldata.map((v) => {
    if (typeof v === 'string') {
      if (toBigint) {
        return BigInt(v);
      }
      return BigInt(v).toString();
    } else if (Array.isArray(v)) {
      return deepswapToBigint(v, toBigint);
    } else {
      return null;
    }
  });
}

type CalldataItem = (string | bigint | CalldataItem | null)[];

interface InputData {
  in1: string;
  in2: string;
  [key: string]: string;
}
