import 'dotenv/config';

const n=(k,d)=>Number.isFinite(Number(process.env[k]))?Number(process.env[k]):d;
export const config={
 port:n('PORT',4100),
 databaseUrl:process.env.DATABASE_URL||'',
 agent:{
  maxIterations:n('AGENT_MAX_ITERATIONS',6),
  thresholds:{high:n('AGENT_HIGH_CONFIDENCE',.8),medium:n('AGENT_MEDIUM_CONFIDENCE',.5),low:n('AGENT_LOW_CONFIDENCE',.3)},
  learningMinSamples:n('AGENT_LEARNING_MIN_SAMPLES',10)
 }
};
