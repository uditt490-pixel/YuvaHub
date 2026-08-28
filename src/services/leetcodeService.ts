import axios from 'axios';

/**
 * Fetches public LeetCode statistics for a given username.
 * Uses the public LeetCode GraphQL API.
 */
export const fetchLeetCodeStats = async (username: string) => {
    try {
        const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
          profile {
            ranking
          }
        }
      }
    `;

        const response = await axios.post('https://leetcode.com/graphql', {
            query,
            variables: { username },
        });

        const data = response.data.data.matchedUser;
        if (!data) {
            throw new Error('LeetCode user not found');
        }

        const stats = data.submitStats.acSubmissionNum;
        const getTotal = (difficulty: string) => stats.find((s: any) => s.difficulty === difficulty)?.count || 0;

        return {
            totalSolved: getTotal('All'),
            easySolved: getTotal('Easy'),
            mediumSolved: getTotal('Medium'),
            hardSolved: getTotal('Hard'),
            ranking: data.profile.ranking,
        };
    } catch (error) {
        console.error(`Error fetching LeetCode stats for ${username}:`, error);
        throw new Error('Failed to fetch LeetCode data');
    }
};
