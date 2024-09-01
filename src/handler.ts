import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  GetCommand,
  PutCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import axios from "axios";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE!;

const getCurrentBitcoinPrice = async () => {
  const response = await axios.get(
    "https://api.coindesk.com/v1/bpi/currentprice/BTC.json"
  );
  return response.data.bpi.USD.rate_float;
};

export const makeGuess = async (event: any) => {
  const { username, guess } = JSON.parse(event.body);
  const tableName = TABLE_NAME || process.env.TABLE_NAME || "UserScores";

  console.log(tableName);

  const getParams = {
    TableName: tableName,
    Key: { username },
  };

  try {
    const result = await ddbDocClient.send(new GetCommand(getParams));
    let user = result.Item;

    if (!user) {
      user = { username, score: 0 };
    }

    const currentTime = Date.now();
    if (user.guessTime && currentTime - user.guessTime < 60000) {
      // Ensure 60 seconds have passed
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Too early to make another guess" }),
      };
    }

    const currentPrice = await getCurrentBitcoinPrice();
    const putParams = {
      TableName: tableName,
      Item: {
        ...user,
        currentGuess: guess,
        guessPrice: currentPrice,
        guessTime: currentTime,
      },
    };

    await ddbDocClient.send(new PutCommand(putParams));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ message: "Guess recorded!", user }),
    };
  } catch (error) {
    console.error("Error occurred during DynamoDB operation:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ message: "Server error", error: error.message }),
    };
  }
};

export const resolveGuess = async (event: any) => {
  const { username } = JSON.parse(event.body);
  const tableName = TABLE_NAME || process.env.TABLE_NAME || "UserScores";

  const getParams = {
    TableName: tableName,
    Key: { username },
  };

  try {
    const result = await ddbDocClient.send(new GetCommand(getParams));
    let user = result.Item;

    if (!user || !user.currentGuess || !user.guessPrice || !user.guessTime) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          message: "No active guess to resolve.",
          inProgress: false,
        }),
      };
    }

    const currentTime = Date.now();
    if (currentTime - user.guessTime < 60000) {
      // Ensure 60 seconds have passed
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          message: "Too early to resolve the guess.",
          inProgress: true,
        }),
      };
    }

    const currentPrice = await getCurrentBitcoinPrice();
    let scoreChange = 0;
    if (
      (user.currentGuess === "up" && currentPrice > user.guessPrice) ||
      (user.currentGuess === "down" && currentPrice < user.guessPrice)
    ) {
      scoreChange = 1; // Guess was correct
    } else {
      scoreChange = -1; // Guess was incorrect
    }

    console.log("#####", username);

    const putParams = {
      TableName: tableName,
      Key: { username },
      Item: {
        username: user.username, // Key attribute
        score: user.score + scoreChange,
        currentGuess: null,
        guessPrice: null,
        guessTime: null,
      },
    };

    await ddbDocClient.send(new PutCommand(putParams));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "Guess resolved!",
        user: putParams.Item,
      }),
    };
  } catch (error) {
    console.error("Error resolving guess:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ message: "Server error", error: error.message }),
    };
  }
};

export const getBettingStatus = async (event: any) => {
  const username = event.pathParameters?.username;
  const tableName = TABLE_NAME || process.env.TABLE_NAME || "UserScores";

  console.log(tableName);
  if (!username) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Username is required" }),
    };
  }

  try {
    const getParams = {
      TableName: tableName,
      Key: { username },
    };

    const result = await ddbDocClient.send(new GetCommand(getParams));

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "User not found" }),
      };
    }

    const { score, currentGuess, guessTime, guessPrice } = result.Item;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        username,
        score,
        currentGuess,
        guessTime,
        guessPrice,
      }),
    };
  } catch (error) {
    console.error("Error fetching user score:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ message: "Server error", error: error.message }),
    };
  }
};
