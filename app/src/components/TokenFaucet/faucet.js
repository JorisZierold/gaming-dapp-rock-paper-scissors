import { createInstance } from "./forwarder";
import { signMetaTxRequest } from "./signer";

async function sendMetaTx(tokenfaucet, signer) {
  const url = `https://api.defender.openzeppelin.com/autotasks/${
    import.meta.env.VITE_OZ_AUTOTASK_KEY
  }`;

  const forwarder = createInstance(signer?.provider);
  const from = signer["_address"];
  const data = tokenfaucet.interface.encodeFunctionData("dispense");
  const to = tokenfaucet.address;

  const txRequest = await signMetaTxRequest(signer?.provider, forwarder, {
    to,
    from,
    data,
  });

  return fetch(url, {
    method: "POST",
    body: JSON.stringify(txRequest),
    headers: { "Content-Type": "application/json" },
  });
}

export async function requestTokens(tokenfaucet, signer) {
  // NOTE If user has native currency to pay for gas, tx could be directly performed.
  return sendMetaTx(tokenfaucet, signer);
}
