import { calculateDownstreamRisk } from "../lib/downstreamRisk";
import { calculateIntegrityScore, type Citation } from "../lib/scoring";

function base(id: string, status: Citation["status"]): Citation {
  return {
    id,
    title: "T",
    authors: "A",
    year: 2020,
    doi: "10.0000/x",
    status,
  };
}

function runScenario(name: string, citations: Citation[]) {
  const score = calculateIntegrityScore(citations);
  const risk = calculateDownstreamRisk(citations);
  console.log(`\n=== ${name} ===`);
  console.log("Integrity score:", score);
  console.log("Downstream risk:", JSON.stringify(risk, null, 2));
}

const clean: Citation[] = [base("1", "clean"), base("2", "clean")];

const oneRetracted: Citation[] = [base("1", "retracted"), base("2", "clean")];

const heavy: Citation[] = [
  base("1", "retracted"),
  base("2", "retracted"),
  base("3", "retracted"),
  base("4", "cascade"),
  base("5", "cascade"),
];

runScenario("Clean paper", clean);
runScenario("One retracted citation", oneRetracted);
runScenario("Three retracted + two cascade", heavy);
