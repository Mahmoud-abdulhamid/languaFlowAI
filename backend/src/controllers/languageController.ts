
import { Request, Response } from 'express';
import { Language } from '../models/Language';
import { z } from 'zod';

export const getAllLanguages = async (req: Request, res: Response) => {
    try {
        const languages = await Language.find().sort({ name: 1 });
        res.json(languages);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createLanguage = async (req: Request, res: Response) => {
    try {
        const schema = z.object({
            name: z.string(),
            code: z.string().min(2),
            nativeName: z.string(),
            direction: z.enum(['ltr', 'rtl']).optional()
        });

        const data = schema.parse(req.body);

        const existing = await Language.findOne({ code: data.code });
        if (existing) return res.status(400).json({ message: 'Language code already exists' });

        const language = await Language.create(data);
        res.status(201).json(language);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateLanguage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const language = await Language.findByIdAndUpdate(id, req.body, { new: true });
        if (!language) return res.status(404).json({ message: 'Language not found' });
        res.json(language);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteLanguage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await Language.findByIdAndDelete(id);
        res.json({ message: 'Language deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
