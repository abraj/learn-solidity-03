import fs from 'node:fs/promises';
import path from 'node:path';
import * as snarkjs from 'snarkjs';

export async function serverZKProof(inputData: InputData) {
  const circuitFile = 'circuit/circuit.wasm';
  const proverKeyFile = 'keys/circuit_final.zkey';
  const verificationKeyFile = 'keys/verification_key.json';

  const basePath = process.cwd() + '/src/api-express/server/zk-proof/';
  const circuitPath = path.resolve(basePath, circuitFile);
  const proverKeyPath = path.resolve(basePath, proverKeyFile);
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
      proverKeyPath
    );
  } catch (err) {
    console.error(err);
    throw new Error('Unable to create proof!');
  }

  const { proof, publicSignals } = proofResp;

  const verificationKey = (await fs.readFile(verificationKeyPath)).toString();
  const vKey = JSON.parse(verificationKey);

  // verify proof
  const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
  if (res !== true) {
    throw new Error('Invalid proof!');
  }

  // // solidity calldata
  // const callDataStr = await snarkjs.groth16.exportSolidityCallData(
  //   proof,
  //   publicSignals
  // );
  // const callDataJson = JSON.parse(`[${callDataStr}]`);
  // const callData = deepswapToBigint(callDataJson);
  // console.log('callData:', callData);

  return true;
}

// function deepswapToBigint(calldata: CalldataItem): CalldataItem {
//   return calldata.map((v) => {
//     if (typeof v === 'string') {
//       return BigInt(v).toString();
//     } else if (Array.isArray(v)) {
//       return deepswapToBigint(v);
//     } else {
//       return null;
//     }
//   });
// }

// type CalldataItem = (string | CalldataItem | null)[];

interface InputData {
  in1: string;
  in2: string;
  [key: string]: string;
}
