import { Schema, model, Document } from 'mongoose';

export interface IScraperBlueprint extends Document {
  name: string;
  targetUrl: string;
  pagination: {
    type: 'button_click' | 'infinite_scroll' | 'url_pattern';
    nextSelector?: string;
    urlParamName?: string;
  };
  renderMode: 'static' | 'dynamic';
  selectors: {
    listContainer: string;
    title: string;
    link: string;
    deadline?: string;
    description?: string;
    organization?: string;
  };
  headers?: Record<string, string>;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ScraperBlueprintSchema = new Schema<IScraperBlueprint>(
  {
    name: { type: String, required: true, unique: true },
    targetUrl: { type: String, required: true },
    pagination: {
      type: {
        type: String,
        enum: ['button_click', 'infinite_scroll', 'url_pattern'],
        required: true,
      },
      nextSelector: { type: String },
      urlParamName: { type: String },
    },
    renderMode: { type: String, enum: ['static', 'dynamic'], required: true },
    selectors: {
      listContainer: { type: String, required: true },
      title: { type: String, required: true },
      link: { type: String, required: true },
      deadline: { type: String },
      description: { type: String },
      organization: { type: String },
    },
    headers: { type: Map, of: String },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ScraperBlueprint = model<IScraperBlueprint>('ScraperBlueprint', ScraperBlueprintSchema);
