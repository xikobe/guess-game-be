// import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
// import { makeGuess, resolveGuess } from './handler';
// import { APIGatewayProxyEvent, Context } from 'aws-lambda';
// import axios from 'axios';

// jest.mock('axios');

// describe('makeGuess and resolveGuess', () => {
//     const sendMock = jest.fn();
//     jest.spyOn(DynamoDBDocumentClient, 'from').mockReturnValue(({
//         ...jest.requireActual(DynamoDBDocumentClient.from),
//         send: sendMock,
//         destroy: jest.fn(),
//     }))

//     beforeEach(() => {
//         sendMock.mockReset();
//         process.env.TABLE_NAME = 'test-table';
//     });

//     it('should record a guess and return a 200 status code', async () => {
//         sendMock.mockResolvedValueOnce({ Item: { username: 'testuser', score: 0 } });
//         axios.get.mockResolvedValueOnce({ data: { bpi: { USD: { rate_float: 50000 } } } });
//         sendMock.mockResolvedValueOnce({});

//         const event = {
//             body: JSON.stringify({ username: 'testuser', guess: 'up' }),
//         } as APIGatewayProxyEvent;

//         const context = {} as Context;

//         const result = await makeGuess(event);

//         expect(result.statusCode).toBe(200);
//         const responseBody = JSON.parse(result.body);
//         expect(responseBody).toHaveProperty('message', 'Guess recorded!');
//         expect(responseBody.user).toMatchObject({
//             username: 'testuser',
//             score: 0,
//             currentGuess: 'up',
//             guessPrice: 50000,
//         });
//     });

//     it('should resolve a guess correctly and update the score', async () => {
//         sendMock.mockResolvedValueOnce({
//             Item: {
//                 username: 'testuser',
//                 score: 0,
//                 currentGuess: 'up',
//                 guessPrice: 50000,
//                 guessTime: Date.now() - 60000, // 60 seconds ago
//             }
//         });

//         axios.get.mockResolvedValueOnce({ data: { bpi: { USD: { rate_float: 51000 } } } });
//         sendMock.mockResolvedValueOnce({});

//         const event = {
//             body: JSON.stringify({ username: 'testuser' }),
//         } as APIGatewayProxyEvent;

//         const context = {} as Context;

//         const result = await resolveGuess(event, context, () => null);

//         expect(result.statusCode).toBe(200);
//         const responseBody = JSON.parse(result.body);
//         expect(responseBody).toHaveProperty('message', 'Guess resolved!');
//         expect(responseBody.user).toMatchObject({
//             username: 'testuser',
//             score: 1,
//             currentGuess: null,
//             guessPrice: null,
//             guessTime: null,
//         });
//     });

//     it('should return a 400 status code if resolving too early', async () => {
//         sendMock.mockResolvedValueOnce({
//             Item: {
//                 username: 'testuser',
//                 score: 0,
//                 currentGuess: 'up',
//                 guessPrice: 50000,
//                 guessTime: Date.now() - 30000, // 30 seconds ago
//             }
//         });

//         const event = {
//             body: JSON.stringify({ username: 'testuser' }),
//         } as APIGatewayProxyEvent;

//         const context = {} as Context;

//         const result = await resolveGuess(event);

//         expect(result.statusCode).toBe(400);
//         const responseBody = JSON.parse(result.body);
//         expect(responseBody).toHaveProperty('message', 'Too early to resolve the guess.');
//     });
// });
