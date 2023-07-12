import { BaseChain, ChainInputs } from 'langchain/chains';
import { BaseChatModel } from 'langchain/chat_models/base';
import { ChainValues } from 'langchain/schema';

import { IconType } from '@cognite/cogs.js';
import { CogniteClient } from '@cognite/sdk';

import {
  addToCopilotEventListener,
  sendFromCopilotEvent,
  sendToCopilotEvent,
} from './utils';
export type CopilotSupportedFeatureType =
  | 'Streamlit'
  | 'IndustryCanvas'
  | 'Infield';

type DefaultMessage = {
  key?: number;
  content: string;
  pending?: boolean;
  actions?: CopilotAction[];
};

type DefaultBotMessage = {
  chain?: string;
} & DefaultMessage;

export type CopilotTextMessage = {
  type: 'text';
  context?: string;
} & DefaultMessage;

export type CopilotHumanApprovalMessage = {
  type: 'human-approval';
  approved?: boolean;
} & DefaultBotMessage;

export type CopilotCodeMessage = {
  type: 'code';
  prevContent?: string;
  highlightLines?: [number, number][]; // [start, end]
  language: 'python';
} & DefaultBotMessage;

export type CopilotDataModelSelectionMessage = {
  type: 'data-model';
  space?: string;
  dataModel?: string;
  version?: string;
} & DefaultBotMessage;

export type CopilotDataModelQueryMessage = {
  type: 'data-model-query';
  space: string;
  dataModel: string;
  version: string;
  graphql: {
    query: string;
    variables: any;
  };
  summary?: string;
  data?: any;
} & DefaultBotMessage;

export type CopilotUserMessage = CopilotTextMessage;
export type CopilotBotMessage =
  | (CopilotTextMessage & DefaultBotMessage)
  | CopilotCodeMessage
  | CopilotDataModelSelectionMessage
  | CopilotHumanApprovalMessage
  | CopilotDataModelQueryMessage;

export type CopilotMessage =
  | (CopilotUserMessage & { source: 'user' })
  | (CopilotBotMessage & {
      source: 'bot';
    });

export type CopilotAction = {
  content: string;
  icon?: IconType;
} & (
  | {
      // THIS IS NOT CACHED, MEANING IF CHAT IS EVER RELOADED, THIS WILL BE LOST
      onClick?: () => void;
    }
  | {
      fromCopilotEvent: Parameters<typeof sendFromCopilotEvent>;
    }
  | {
      toCopilotEvent: Parameters<typeof sendToCopilotEvent>;
    }
);

/**
 * @returns whether to accept more inputs
 */
export type ProcessMessageFunc = (
  sdk: CogniteClient,
  message: string,
  pastMessages: CopilotMessage[]
) => Promise<boolean>;

/**
 * @returns a list of actions to present to users
 */
export type GetActionsFunc = (
  sdk: CogniteClient,
  pastMessages: CopilotMessage[],
  sendMessage: (message: CopilotBotMessage) => Promise<void>
) => Promise<CopilotAction[]>;

export interface CogniteChainInput extends ChainInputs {
  /** LLM Wrapper to use */
  llm: BaseChatModel;
  /** Which variables should be returned as a result of executing the chain. If not specified, output of the last of the chains is used. */
  outputVariables?: string[];
  /** Whether or not to return all intermediate outputs and variables (excluding initial input variables). */
  returnAll?: boolean;
  /** Cognite Client */
  sdk: CogniteClient;

  messages: React.RefObject<CopilotMessage[]>;
  humanApproval?: boolean;
}

export abstract class CogniteBaseChain extends BaseChain {
  public abstract description: string;

  constructor(fields: CogniteChainInput) {
    super(fields);
    const name = this.constructor.name;
    if (!!fields?.humanApproval) {
      this.callbacks = [
        {
          async handleChainStart(_: ChainValues) {
            return new Promise((resolve, reject) => {
              sendToCopilotEvent('NEW_MESSAGES', [
                {
                  source: 'bot',
                  type: 'human-approval',
                  content: `Run "${name}" chain?`,
                  pending: true,
                  chain: this.constructor.name,
                },
              ]);
              const removeListener = addToCopilotEventListener(
                'NEW_MESSAGES',
                (data) => {
                  if (data.length === 1 && data[0].type === 'human-approval') {
                    removeListener();
                    if (data[0].approved) {
                      return resolve();
                    } else {
                      sendToCopilotEvent('NEW_MESSAGES', [
                        {
                          source: 'bot',
                          type: 'text',
                          content: `Ok, I won't run "${name}" chain.`,
                          pending: false,
                          chain: this.constructor.name,
                        },
                      ]);
                      return reject();
                    }
                  }
                }
              );
            });
          },
        },
      ];
    }
  }
}

export type CopilotEvents = {
  FromCopilot: {
    // copilot is successfully mounted
    CHAT_READY: undefined;
    // get code from selected area
    GET_CODE_FOR_SELECTION: undefined;
    // get all code from streamlit
    GET_CODE: undefined;
    // send code to streamlit
    USE_CODE: {
      content: string;
    };

    // get the external asset id from infield
    GET_EXTERNAL_ASSETID: undefined;
    // send documentId to infield
    PUSH_DOC_ID: {
      content: string;
    };
    // send code to streamlit
    GQL_QUERY: {
      query: string;
      variables: any;
    };
    GET_LANGUAGE: undefined;
  };
  ToCopilot: {
    // only the last message will be processed
    NEW_MESSAGES: CopilotMessage[];
    LOADING_STATUS: {
      status: string;
    };
    // get code from selected area
    GET_CODE_FOR_SELECTION: {
      content: string;
    };
    // get all code from streamlit
    GET_CODE: {
      content: string;
    };
    // get the external asset id from infield
    GET_EXTERNAL_ASSETID: {
      content: string;
    };
    // get response from infield
    PUSH_DOC_ID: undefined;

    // get the language of the page from infield
    GET_LANGUAGE: {
      content: string;
    };
  };
};
