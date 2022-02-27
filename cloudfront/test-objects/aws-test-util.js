import { promisify } from 'util'
import * as child from 'child_process'
import * as path from 'path'

const exec = promisify(child.exec)

export const awsCloudfrontTestFunction = async (functionName, testObjectFileName) => {
  const testObjectPath = path.join(__dirname, testObjectFileName)
  // Exec output contains both stderr and stdout outputs
  const testObject = await exec(
    `cat \\
    ${testObjectPath}`
  )

  const describe = await exec(
    `aws cloudfront describe-function \\
    --name ${functionName} \\
    --output json`
  )

  const testResult = await exec(
    `aws cloudfront test-function \\
    --if-match ${JSON.parse(describe.stdout.trim()).ETag} \\
    --name ${functionName} \\
    --event-object fileb://${testObjectPath} \\
    --output json`
  )
  const result = JSON.parse(testResult.stdout.trim())
  result.TestResult.FunctionOutput = JSON.parse(result.TestResult.FunctionOutput)
  return {
    object: JSON.parse(testObject.stdout.trim()),
    result: result.TestResult,
    output: result.TestResult.FunctionOutput,
  }
}
