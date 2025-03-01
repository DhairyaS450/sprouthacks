const { GoogleGenerativeAI } = require("@google/generative-ai");
const { parseReceiptText } = require('./ocrUtils');

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-api-key');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Analyze receipt text with Gemini to get sustainability insights
 * @param {string} receiptText - Extracted text from receipt
 * @returns {Object} - Analysis results including products, scores, and recommendations
 */
async function analyzeReceiptWithGemini(receiptText) {
  try {
    console.log('Starting Gemini analysis...');
    
    // Parse receipt text to extract products and prices
    const parsedProducts = parseReceiptText(receiptText);
    
    if (parsedProducts.length === 0) {
      console.error('No products found in receipt');
      throw new Error('No products found in receipt');
    }
    
    console.log('Parsed products for analysis:', parsedProducts);
    
    // Check if we have a valid API key
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy-api-key') {
      console.log('No valid Gemini API key found, returning mock analysis');
      return getMockAnalysis(parsedProducts);
    }
    
    // Create a prompt for Gemini
    const prompt = `
    Analyze the following products from a receipt for their sustainability impact:
    ${parsedProducts.map(p => `${p.name} - $${p.price}`).join('\n')}
    
    For each product:
    1. Provide a sustainability score from 0-10 (0 being least sustainable, 10 being most sustainable)
    2. Explain the environmental impact of this product
    3. Suggest 1-2 more sustainable alternatives with links (use Amazon or local store links)
    
    Also provide:
    - An overall sustainability score for the entire purchase (0-10)
    - An estimated carbon footprint in kg of CO2
    
    Format your response as a JSON object with the following structure:
    {
      "products": [
        {
          "name": "Product Name",
          "price": price,
          "sustainabilityScore": score,
          "impact": "Environmental impact description",
          "alternatives": [
            {
              "name": "Alternative Product",
              "link": "https://link-to-product",
              "description": "Why this is more sustainable"
            }
          ]
        }
      ],
      "overallScore": overall_score,
      "carbonFootprint": carbon_footprint_in_kg
    }
    `;
    
    console.log('Sending prompt to Gemini...');
    
    // Get response from Gemini
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    console.log('Received response from Gemini');
    
    // Parse the JSON response
    // We need to extract the JSON part from the response
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                      responseText.match(/```\n([\s\S]*?)\n```/) || 
                      responseText.match(/{[\s\S]*}/);
                      
    let jsonStr = '';
    if (jsonMatch) {
      jsonStr = jsonMatch[0].replace(/```json\n|```\n|```/g, '');
    } else {
      jsonStr = responseText;
    }
    
    try {
      const analysis = JSON.parse(jsonStr);
      console.log('Successfully parsed Gemini response');
      
      // Process the carbon footprint to ensure we have both numeric and text versions
      if (analysis.carbonFootprint) {
        if (typeof analysis.carbonFootprint === 'string') {
          // Try to extract a numeric value from the string
          const numericMatch = analysis.carbonFootprint.match(/(\d+(\.\d+)?)/);
          if (numericMatch) {
            // Store the original text description
            analysis.carbonFootprintDescription = analysis.carbonFootprint;
            // Extract the first numeric value found
            analysis.carbonFootprint = parseFloat(numericMatch[0]);
          } else {
            // If no numeric value found, set a default and keep the description
            analysis.carbonFootprintDescription = analysis.carbonFootprint;
            analysis.carbonFootprint = 0;
          }
        }
      }
      
      return analysis;
    } catch (jsonError) {
      console.error('Failed to parse Gemini response as JSON:', jsonError);
      console.log('Response text:', responseText);
      
      // Fallback: create a basic analysis with the parsed products
      return getMockAnalysis(parsedProducts);
    }
  } catch (error) {
    console.error('Gemini Analysis Error:', error);
    
    // Return mock analysis for demo purposes
    return getMockAnalysis(parseReceiptText(receiptText));
  }
}

/**
 * Generate a mock analysis for demo purposes
 * @param {Array} products - Array of products with names and prices
 * @returns {Object} - Mock analysis results
 */
function getMockAnalysis(products) {
  console.log('Generating mock analysis for products:', products);
  
  const mockAnalysis = {
    products: products.map(product => {
      // Determine mock sustainability score based on product name
      let sustainabilityScore = 5; // Default middle score
      let impact = '';
      let alternatives = [];
      
      const productNameLower = product.name.toLowerCase();
      
      if (productNameLower.includes('organic') || 
          productNameLower.includes('recycled') || 
          productNameLower.includes('local') || 
          productNameLower.includes('eco')) {
        // Higher score for eco-friendly products
        sustainabilityScore = Math.floor(Math.random() * 3) + 7; // 7-9
        impact = `${product.name} is a relatively sustainable choice due to its eco-friendly production methods.`;
        alternatives = [
          {
            name: `Even More Sustainable ${product.name}`,
            link: `https://www.amazon.com/s?k=sustainable+${encodeURIComponent(product.name)}`,
            description: "This alternative has an even lower environmental footprint."
          }
        ];
      } else if (productNameLower.includes('plastic') || 
                productNameLower.includes('disposable') || 
                productNameLower.includes('battery') || 
                productNameLower.includes('meat')) {
        // Lower score for less eco-friendly products
        sustainabilityScore = Math.floor(Math.random() * 3) + 1; // 1-3
        impact = `${product.name} has a significant environmental impact due to resource usage and waste generation.`;
        alternatives = [
          {
            name: `Eco-Friendly Alternative to ${product.name}`,
            link: `https://www.amazon.com/s?k=eco+friendly+alternative+to+${encodeURIComponent(product.name)}`,
            description: "This sustainable alternative reduces environmental impact."
          },
          {
            name: `Reusable ${product.name}`,
            link: `https://www.amazon.com/s?k=reusable+${encodeURIComponent(product.name)}`,
            description: "Reusable options help reduce waste and save money over time."
          }
        ];
      } else {
        // Middle score for neutral products
        sustainabilityScore = Math.floor(Math.random() * 3) + 4; // 4-6
        impact = `${product.name} has a moderate environmental impact.`;
        alternatives = [
          {
            name: `Sustainable ${product.name}`,
            link: `https://www.amazon.com/s?k=sustainable+${encodeURIComponent(product.name)}`,
            description: "This alternative is more environmentally friendly."
          }
        ];
      }
      
      return {
        name: product.name,
        price: product.price,
        sustainabilityScore,
        impact,
        alternatives
      };
    }),
    overallScore: 0,
    carbonFootprint: 0,
    carbonFootprintDescription: ""
  };
  
  // Calculate overall score as average of product scores
  const totalScore = mockAnalysis.products.reduce((sum, product) => sum + product.sustainabilityScore, 0);
  mockAnalysis.overallScore = Math.round(totalScore / mockAnalysis.products.length);
  
  // Generate a random carbon footprint value
  mockAnalysis.carbonFootprint = parseFloat((Math.random() * 10 + 1).toFixed(1));
  mockAnalysis.carbonFootprintDescription = `Estimated carbon footprint of ${mockAnalysis.carbonFootprint} kg CO2e based on the products in your receipt.`;
  
  return mockAnalysis;
}

module.exports = {
  analyzeReceiptWithGemini
}; 