import { promises as fs } from "fs";
import fetch from "node-fetch";

async function storeGenesis(
    genesis: string,
    fileName: string
): Promise<string> {
    const genesisPath = `./${fileName}`;

    await fs.writeFile(genesisPath, genesis, "utf8");

    return genesisPath;
}

async function downloadGenesis(): Promise<string> {
    const url = "http://dev.greenlight.bcovrin.vonx.io/genesis";

    const response = await (await fetch(url)).text();

    return response;
}

export { downloadGenesis, storeGenesis };
