import fs from 'fs'
import dotenv from 'dotenv'
import { execSync } from 'child_process';
// import { WarpFactory, defaultCacheOptions } from "warp-contracts";
// import Arweave from "arweave";

dotenv.config()

// const ANT = "Tox1YO--_IKNcd6S1RZ0RqmP-72XrmW4JEtqIVk410E"
// const SUBDOMAIN = "gitar"

// const jwk = JSON.parse(Buffer.from(process.env.WALLET64, "base64").toString("utf-8"));
// console.log(jwk)
// const arweave = Arweave.init({ host: "arweave.net", port: 443, protocol: "https" });
// const warp = WarpFactory.custom(arweave, defaultCacheOptions, "mainnet").useArweaveGateway().build();

// const contract = warp.contract(ANT).connect(jwk);


// const _ = (err, stdout, stderr) => {
//     if (err) {
//         console.log(err)
//         return
//     }
//     console.log(stdout)
//     console.log(stderr)
// }

const timestampString = new Date().toString().replace(/:/g, "-").replace(/\./g, "-")
console.log("Creating Folder...")
const createOutput = JSON.parse(execSync(`ardrive create-folder -w '${process.env.WALLET_PATH}' -n "${timestampString}" -F ${process.env.ROOT_EID} ${process.env.TURBO == "YES" && "--turbo > ./create-folder-output.json"}`).toString())
// const createOutput = JSON.parse(fs.readFileSync('./create-folder-output.json'))
const folderEid = createOutput.created[0].entityId
console.log("Folder created with EID: " + folderEid)

console.log("Uploading...")
execSync(`cd ./out && ardrive upload-file -w '${process.env.WALLET_PATH}' -l ./ -F "${folderEid}" ${process.env.TURBO == "YES" && "--turbo"}`)

console.log("Creating manifest...")
execSync(`ardrive create-manifest -w '${process.env.WALLET_PATH}' -f ${folderEid} ${process.env.TURBO == "YES" && "--turbo"} --dry-run > manifest.json`)

console.log("Modifying manifest...")
const output = JSON.parse(fs.readFileSync('./manifest.json'))

const manifest = output.manifest

manifest.index.path = "index.html"
const paths = manifest.paths

Object.keys(paths).forEach((key) => {
    paths[key.replace("./", "")] = paths[key]
    delete paths[key]
})

console.log(manifest)

fs.writeFileSync('./out/manifest.json', JSON.stringify(manifest, null, 2))

console.log("Uploading manifest...")
execSync(`cd ./out && ardrive upload-file -w "${process.env.WALLET_PATH}" -l ./manifest.json --content-type application/x.arweave-manifest+json -F ${folderEid} ${process.env.TURBO == "YES" && "--turbo"} > ../out.json`)

const out = JSON.parse(fs.readFileSync('./out.json'))
console.log(out)

const dataTxnId = out.created[0].dataTxId
console.log("deployed at https://arweave.net/" + dataTxnId)


// // console.log("Updating ANT token...")
// // contract.writeInteraction({
// //     function: "setRecord",
// //     subDomain: SUBDOMAIN,
// //     transactionId: dataTxnId,
// //     ttlSeconds: 3600
// // }).then((tx) => {
// //     console.log(tx.originalTxId)
// // }).catch((err) => {
// //     console.log(err)
// // })
