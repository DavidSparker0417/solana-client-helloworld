import { addKeypairToEnvFile, getKeypairFromEnvironment } from "@solana-developers/helpers"
import web3 from "@solana/web3.js"
import "dotenv/config"

const PROGRAM_ID = "3qoZu7TqomHpPto1chZuz55pRS9DsT6DfjPumcxJQgwy"

// generate or load keypair 
function generateKeyPair(): web3.Keypair {
  let keypair
  const SECRET_KEY = "SECRET_KEY"

  // check if secret key exists in env file
  if (!process.env.SECRET_KEY) {
    keypair = web3.Keypair.generate()
    addKeypairToEnvFile(keypair, SECRET_KEY)
  } else {
    keypair = getKeypairFromEnvironment(SECRET_KEY)
  }
  console.log(`PublicKey :: ${keypair.publicKey.toBase58()}`)
  return keypair
}

async function airdropIfRequired(connection: web3.Connection, account: web3.PublicKey) {
  let balance = await connection.getBalance(account)
  console.log(`Current Balance: ${balance / web3.LAMPORTS_PER_SOL} SOL`)
  if (balance < web3.LAMPORTS_PER_SOL) {
    console.log("airdropping...")
    const signature = await connection.requestAirdrop(account, web3.LAMPORTS_PER_SOL * 1)
    await connection.confirmTransaction(signature)
    balance = await connection.getBalance(account)
    console.log(`New Balance: ${balance / web3.LAMPORTS_PER_SOL} SOL`)
  }
}

async function initialize() {
  const keypair = generateKeyPair()
  // initialize connection
  const connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed')
  // airdrop
  await airdropIfRequired(connection, keypair.publicKey)
  return { wallet: keypair, connection }
}

async function main() {
  const { wallet, connection } = await initialize()
  const transaction = new web3.Transaction()
  const instruction = new web3.TransactionInstruction({
    keys: [],
    programId: new web3.PublicKey(PROGRAM_ID)
  })

  transaction.add(instruction)
  const txHash = await web3.sendAndConfirmTransaction(
    connection, transaction, [wallet]
  )

  console.log(`Transaction: https://explorer.solana.com/tx/${txHash}?cluster=devnet`)
}

main()
