import AWS from 'aws-sdk/global'
import 'aws-sdk/clients/s3'

const ROLE_ARN = 'arn:aws:iam::606626980680:role/Superown.com'

export function setCredentials (idToken) {
  AWS.config.credentials = new AWS.WebIdentityCredentials({
    RoleArn: ROLE_ARN,
    WebIdentityToken: idToken
  })

  // AwsBucket = new AWS.S3()
}

export function AwsBucket (region) {
  return new AWS.S3({region: region})
}

export function destroy () {
  // AwsBucket = null
}

AWS.config.update({
  logger: console
})
