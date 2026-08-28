import { Request, Response } from "express";
import { TestimonialService } from "../services/testimonialService.js";
import { sendSuccess } from "../../lib/apiResponse.js";
import { AppError } from "../../lib/AppError.js";
import { testimonialSchema } from "../../models/testimonialSchema.js";

export const createTestimonial = async (req: Request, res: Response) => {
  const user = req.user;
  const parsed = testimonialSchema.partial({ 
    id: true, status: true, isHighlighted: true, createdAt: true, updatedAt: true 
  }).safeParse({ ...req.body, authorId: user.uid });
  
  if (!parsed.success) {
    throw AppError.badRequest(parsed.error.issues?.[0]?.message || "Validation failed");
  }

  const result = await TestimonialService.createTestimonial(parsed.data);
  return sendSuccess(res, { message: "Testimonial submitted successfully.", data: result }, 201);
};

export const getPublicTestimonials = async (req: Request, res: Response) => {
  const uid = req.params.uid as string;
  if (!uid) throw AppError.badRequest("User ID is required");

  const testimonials = await TestimonialService.getPublicTestimonials(uid);
  return sendSuccess(res, { data: testimonials });
};

export const getTestimonialInbox = async (req: Request, res: Response) => {
  const user = req.user;
  const inbox = await TestimonialService.getTestimonialInbox(user.uid);
  return sendSuccess(res, { data: inbox });
};

export const updateTestimonialStatus = async (req: Request, res: Response) => {
  const user = req.user;
  const id = req.params.id as string;
  const { status } = req.body;

  if (!status) throw AppError.badRequest("Status is required");

  const updated = await TestimonialService.updateStatus(user.uid, id, status);
  return sendSuccess(res, { message: "Status updated", data: updated });
};

export const toggleHighlight = async (req: Request, res: Response) => {
  const user = req.user;
  const id = req.params.id as string;
  const { isHighlighted } = req.body;

  if (typeof isHighlighted !== 'boolean') {
    throw AppError.badRequest("isHighlighted boolean is required");
  }

  const updated = await TestimonialService.toggleHighlight(user.uid, id, isHighlighted);
  return sendSuccess(res, { message: "Highlight updated", data: updated });
};
