const fetch = require('node-fetch');

const PINTEREST_APP_ID = process.env.PINTEREST_APP_ID;
const PINTEREST_ACCESS_TOKEN = process.env.PINTEREST_ACCESS_TOKEN;

const BOARD_IDS = [
    'iamyohannes6/made-by-me-winball-betting',
    'iamyohannes6/made-by-me-clubs',
    'iamyohannes6/made-by-me-graphic-designs'
];

exports.handler = async (event) => {
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

    try {
        // Fetch pins from all boards
        const allPins = await Promise.all(
            BOARD_IDS.map(boardId => 
                fetch(`https://api.pinterest.com/v3/boards/${boardId}/pins`, {
                    headers: {
                        'Authorization': `Bearer ${PINTEREST_ACCESS_TOKEN}`,
                        'Pinterest-API-Version': '2023-07-26'
                    }
                }).then(res => res.json())
            )
        );

        // Combine and shuffle pins from all boards
        const combinedPins = allPins
            .flatMap(response => response.items || [])
            .filter(pin => pin.media?.images?.original) // Ensure pin has an image
            .map(pin => ({
                id: pin.id,
                title: pin.title || '',
                description: pin.description || '',
                imageUrl: pin.media.images.original.url,
                link: pin.link || `https://pinterest.com/pin/${pin.id}`
            }));

        // Shuffle the pins
        const shuffledPins = combinedPins.sort(() => Math.random() - 0.5);

        // Return only the first 12 pins (or adjust this number as needed)
        const selectedPins = shuffledPins.slice(0, 12);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                pins: selectedPins
            })
        };
    } catch (error) {
        console.error('Pinterest API Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: 'Failed to fetch Pinterest pins'
            })
        };
    }
};
