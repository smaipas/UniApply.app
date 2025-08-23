const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const ses = new SESClient({ region: "us-east-1" });

async function testEmail() {
  try {
    console.log("Testing email notification...");

    const result = await ses.send(
      new SendEmailCommand({
        FromEmailAddress: "no-reply@uniapply.com",
        Destination: {
          ToAddresses: ["test@example.com"], // Replace with a real email for testing
        },
        Content: {
          Simple: {
            Subject: { Data: "Test Email from UniApply" },
            Body: {
              Text: { Data: "This is a test email to verify SES is working." },
            },
          },
        },
      })
    );

    console.log("Email sent successfully:", result);
  } catch (error) {
    console.error("Email test failed:", error);
  }
}

testEmail();
