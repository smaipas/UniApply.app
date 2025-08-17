import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  // types
  CognitoIdentityProviderServiceException,
} from '@aws-sdk/client-cognito-identity-provider'

const client = new CognitoIdentityProviderClient({ region: import.meta.env.VITE_COGNITO_REGION })
const ClientId = import.meta.env.VITE_COGNITO_CLIENT_ID

export async function signUp({
  email,
  password,
  givenName,
  familyName,
}: {
  email: string
  password: string
  givenName: string
  familyName: string
}) {
  try {
    return await client.send(
      new SignUpCommand({
        ClientId,
        Username: email,
        Password: password,
        UserAttributes: [
          { Name: 'given_name', Value: givenName },
          { Name: 'family_name', Value: familyName },
          { Name: 'email', Value: email },
        ],
      }),
    )
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err: any = e
    if (err instanceof CognitoIdentityProviderServiceException) throw err
    throw new Error(err?.message || 'Unknown error during sign up')
  }
}

export async function confirmSignUp(email: string, code: string) {
  try {
    return await client.send(
      new ConfirmSignUpCommand({ ClientId, Username: email, ConfirmationCode: code }),
    )
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err: any = e
    if (err instanceof CognitoIdentityProviderServiceException) throw err
    throw new Error(err?.message || 'Unknown error during confirm sign up')
  }
}

export async function signIn(email: string, password: string) {
  try {
    return await client.send(
      new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId,
        AuthParameters: { USERNAME: email, PASSWORD: password },
      }),
    )
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err: any = e
    if (err instanceof CognitoIdentityProviderServiceException) throw err
    throw new Error(err?.message || 'Unknown error during sign in')
  }
}

export async function refreshTokens(refreshToken: string) {
  try {
    return await client.send(
      new InitiateAuthCommand({
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId,
        AuthParameters: { REFRESH_TOKEN: refreshToken },
      }),
    )
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err: any = e
    if (err instanceof CognitoIdentityProviderServiceException) throw err
    throw new Error(err?.message || 'Unknown error during token refresh')
  }
}

export async function forgotPassword(email: string) {
  try {
    return await client.send(new ForgotPasswordCommand({ ClientId, Username: email }))
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err: any = e
    if (err instanceof CognitoIdentityProviderServiceException) throw err
    throw new Error(err?.message || 'Unknown error during forgot password')
  }
}

export async function confirmForgotPassword(email: string, code: string, newPassword: string) {
  try {
    return await client.send(
      new ConfirmForgotPasswordCommand({
        ClientId,
        Username: email,
        ConfirmationCode: code,
        Password: newPassword,
      }),
    )
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err: any = e
    if (err instanceof CognitoIdentityProviderServiceException) throw err
    throw new Error(err?.message || 'Unknown error during confirm forgot password')
  }
}
