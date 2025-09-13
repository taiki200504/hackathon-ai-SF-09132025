/**
 * zypher.ts - Meme caption generation utilities
 */

// Caption option type definition
export type CaptionOption = {
  style: string;
  top: string;
  bottom: string;
  alt_text: string;
};

/**
 * Mock implementation that returns static funny captions
 * @param tags Array of content tags
 * @param memeCandidates Array of meme style candidates
 * @returns Array of caption options
 */
export async function runZypherPipelineMock(
  tags: string[] = [],
  memeCandidates: string[] = []
): Promise<CaptionOption[]> {
  // Static funny captions for demo purposes
  const options: CaptionOption[] = [
    {
      style: "top_bottom",
      top: "WHEN YOU FINALLY",
      bottom: "FINISH YOUR CODE WITHOUT BUGS",
      alt_text: "Celebration meme about bug-free code",
    },
    {
      style: "top_bottom",
      top: "THAT MOMENT",
      bottom: "WHEN THE DEMO ACTUALLY WORKS",
      alt_text: "Relief when demo works perfectly",
    },
    {
      style: "tweet_style",
      top: "Nobody:\n\nProgrammers:",
      bottom: "Is this a bug or a feature?",
      alt_text: "Joke about programmers confusing bugs and features",
    },
    {
      style: "top_bottom",
      top: "ONE DOES NOT SIMPLY",
      bottom: "WRITE BUG-FREE CODE",
      alt_text: "Boromir meme about writing code",
    },
    {
      style: "top_bottom",
      top: "DEBUGGING",
      bottom: "THE ART OF FINDING OUT WHY CODE WORKS",
      alt_text: "Joke about debugging process",
    },
  ];

  return options;
}

/**
 * Real implementation that calls CoreSpeed if environment variables are set
 * @param tags Array of content tags
 * @param memeCandidates Array of meme style candidates
 * @returns Array of caption options
 */
export async function runZypherPipeline(
  tags: string[] = [],
  memeCandidates: string[] = []
): Promise<CaptionOption[]> {
  // Check if CoreSpeed URL and pipeline ID are set
  const coreSpeedUrl = process.env.CORESPEED_URL;
  const pipelineId = process.env.ZYPHER_PIPELINE_ID;

  // If not set, fall back to mock implementation
  if (!coreSpeedUrl || !pipelineId) {
    console.log("CoreSpeed URL or pipeline ID not set, using mock data");
    return runZypherPipelineMock(tags, memeCandidates);
  }

  try {
    // TODO: Implement CoreSpeed API call
    // This is a placeholder for future implementation
    console.log("TODO: Implement CoreSpeed API call");
    
    // For now, return mock data
    return runZypherPipelineMock(tags, memeCandidates);
  } catch (error) {
    console.error("Error calling CoreSpeed:", error);
    // Fall back to mock implementation on error
    return runZypherPipelineMock(tags, memeCandidates);
  }
}