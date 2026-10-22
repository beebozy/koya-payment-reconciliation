
const fs = require("fs");

// Store the latest event for each transaction.
const latest = new Map();

const lines = fs
  .readFileSync("payments.jsonl", "utf8")
  .split("\n");

for (const line of lines) {
  if (!line.trim()) continue;

  let event;

  try {
    event = JSON.parse(line);
  } catch (error) {
    // Ignore malformed JSON lines.
    continue;
  }

 
  if (!event.txn_id) continue;

  const previous = latest.get(event.txn_id);


  if (
    !previous ||
    Date.parse(event.ts) > Date.parse(previous.ts)
  ) {
    latest.set(event.txn_id, event);
  }
}

// Only the latest successful attempt counts.
let total = 0;
let count = 0;

for (const event of latest.values()) {
  if (event.status === "success") {
    count++;
    total += Number(event.amount);
  }
}

const expected = parseInt(
  fs.readFileSync("expected.txt", "utf8").trim(),
  10
);

if (count !== expected) {
  console.log(
    `Check failed: counted ${count} successful payments, expected ${expected}.`
  );
  console.log(
    "Something in the data isn't being handled the way the README describes."
  );
} else {
  console.log(`Check passed: ${count} successful payments.`);
  console.log(`Your code: KOYA-${Math.round(total)}`);
}
