# Guessing Game Backend

## Overview

This project implements the backend for a Bitcoin price guessing game. The backend is built using AWS Lambda, DynamoDB, and the Coindesk API. It allows users to place bets on whether the price of Bitcoin will go up or down within a specific timeframe. The main functionalities provided by this backend include:

- **Make a Guess**: Users can submit their guesses on whether the Bitcoin price will increase or decrease. If the user is new, they are added to the database with an initial score of zero. A guess can only be made once every 60 seconds.

- **Resolve a Guess**: After a set period, users can resolve their guesses to see if they were correct and update their score.

- **Get Betting Status**: Users can retrieve their current betting status, including their score, current guess, and other relevant details.

### Endpoints

1. **`POST /guess`** - *makeGuess*:  
   Records a user's guess on whether the Bitcoin price will go up or down. If the user is new, they are added to the database with an initial score of zero. A guess can only be made once every 60 seconds.

2. **`POST /resolve`** - *resolveGuess*:  
   Resolves the user's most recent guess, checks whether it was correct or incorrect, and updates the user's score accordingly. This operation can only be performed 60 seconds after the guess was made.

3. **`GET /get-score/{username}`** - *getBettingStatus*:  
   Retrieves the current score and betting status of the specified user, including any active guesses.

## Environment Variables

- **`DYNAMODB_TABLE`**: Name of the DynamoDB table used to store user scores and guesses.
- **`BTC_API_URL`**: URL of the API used to fetch the current Bitcoin price. (e.g., `https://api.coindesk.com/v1/bpi/currentprice/BTC.json`).

## Potential Improvements

- **Error Handling**: 
  - Improve the granularity and detail of error messages returned to the client.
  - Implement better handling of external API errors (e.g., if Coindesk API fails).

- **Rate Limiting**:
  - Implement rate limiting to prevent users from spamming the API with guesses.

- **Security Enhancements**:
  - Add authentication and authorization to ensure that only authorized users can interact with the API.
  - Sanitize and validate all inputs more rigorously to prevent injection attacks.

- **Data Validation**:
  - Ensure that inputs are validated according to stricter criteria, especially for usernames and guess values.

- **Scalability**:
  - Implement caching for frequent requests, such as current Bitcoin prices, to reduce the load on the external API.
  - Optimize DynamoDB table design for scalability, possibly by partitioning data based on user activity.

- **Logging & Monitoring**:
  - Enhance logging to provide more detailed insights into user activities and system performance.
  - Integrate monitoring tools like AWS CloudWatch for better observability and alerts on critical failures.

- **Test Coverage**:
  - Expand unit and integration tests to cover more edge cases and potential failure scenarios.
  - Introduce load testing to ensure the service can handle high traffic scenarios.

- **User Experience**:
  - Add features like historical guess performance or leaderboards to engage users more effectively.
  - Implement a grace period for guess resolution to account for slight delays in the Bitcoin price updates from the API.

- **Deployment & CI/CD**:
  - Set up a CI/CD pipeline to automate testing and deployment to AWS.
  - Use infrastructure-as-code tools like AWS CloudFormation or Terraform for consistent and repeatable deployments.
