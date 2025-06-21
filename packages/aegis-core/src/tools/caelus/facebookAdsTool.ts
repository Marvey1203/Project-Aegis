import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import { config } from '../../config/index.js';
// @ts-expect-error: No types available for facebook-nodejs-business-sdk
import bizSdk from 'facebook-nodejs-business-sdk';

const AdAccount = bizSdk.AdAccount;
const Campaign = bizSdk.Campaign;

const api = bizSdk.FacebookAdsApi.init(config.facebook.accessToken);

class FacebookAdsTool extends Tool {
  name = 'facebookCreateCampaignTool';
  description = 'Creates a new advertising campaign on Facebook. Input should be a JSON string with the campaign name, objective, and ad account ID.';

  schema = z.object({
    input: z.string().optional(),
  }).transform(val => val?.input ?? '');

  protected async _call(input: string): Promise<string> {
    if (!input) {
      return 'Error: Input JSON string must be provided.';
    }
    if (!config.facebook.accessToken) {
        return 'Error: Facebook Access Token is not configured.';
    }

    try {
      const { name, objective, adAccountId } = JSON.parse(input);
      
      if (!name || !objective || !adAccountId) {
        return 'Error: "name", "objective", and "adAccountId" are required in the input JSON.';
      }

      const account = new AdAccount(adAccountId);
      const campaign = await account.createCampaign(
        [Campaign.Fields.id],
        {
          [Campaign.Fields.name]: name,
          [Campaign.Fields.objective]: objective,
          [Campaign.Fields.status]: Campaign.Status.paused,
        }
      );

      const campaignId = campaign.id;
      return `Successfully created Facebook campaign with ID: ${campaignId}`;

    } catch (error: any) {
      console.error('Facebook API Error:', error);
      return `Error creating Facebook campaign: ${error.message}`;
    }
  }
}

export const facebookAdsTool = new FacebookAdsTool();
