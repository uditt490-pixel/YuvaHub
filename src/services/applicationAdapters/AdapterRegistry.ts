/**
 * Adapter Registry
 *
 * Responsible for:
 * - Registering supported application platforms
 * - Selecting correct adapter
 */

import { InternshalaApplyAdapter } from "./InternshalaApplyAdapter";
import { DevpostApplyAdapter } from "./DevpostApplyAdapter";


export interface ApplicationAdapter {

  platform: string;


  submitApplication(
    payload: any
  ): Promise<{
    success: boolean;
    externalId?: string;
    message?: string;
  }>;


  validate(
    payload:any
  ): Promise<boolean>;

}



class AdapterRegistry {

  private adapters:
    Map<string, ApplicationAdapter>;


  constructor(){

    this.adapters =
      new Map();


    this.register(
      new InternshalaApplyAdapter()
    );


    this.register(
      new DevpostApplyAdapter()
    );

  }



  register(
    adapter: ApplicationAdapter
  ){

    this.adapters.set(
      adapter.platform.toLowerCase(),
      adapter
    );

  }



  getAdapter(
    platform:string
  ){

    const adapter =
      this.adapters.get(
        platform.toLowerCase()
      );


    if(!adapter){

      throw new Error(
        `Unsupported application platform: ${platform}`
      );

    }


    return adapter;

  }



  supportedPlatforms(){

    return [
      ...this.adapters.keys()
    ];

  }

}


export const applicationAdapterRegistry =
  new AdapterRegistry();