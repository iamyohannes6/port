const fetch = require('node-fetch');

const PINTEREST_APP_ID = process.env.PINTEREST_APP_ID;
const PINTEREST_ACCESS_TOKEN = process.env.PINTEREST_ACCESS_TOKEN;

const BOARD_IDS = [
    'iamyohannes6/made-by-me-winball-betting',
    'iamyohannes6/made-by-me-clubs',
    'iamyohannes6/made-by-me-graphic-designs'
];

exports.handler = async (event) => {
    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            }
        };
    }

    console.log('Pinterest function started');
    console.log('App ID:', PINTEREST_APP_ID);
    console.log('Token available:', !!PINTEREST_ACCESS_TOKEN);

    if (!PINTEREST_ACCESS_TOKEN || !PINTEREST_APP_ID) {
        console.error('Pinterest credentials not configured');
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: 'Pinterest API not configured'
            })
        };
    }
