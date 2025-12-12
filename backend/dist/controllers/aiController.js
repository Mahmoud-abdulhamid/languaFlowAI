"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateSegment = void 0;
const aiService_1 = require("../services/aiService");
const Segment_1 = require("../models/Segment");
const translateSegment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { text, sourceLang, targetLang, segmentId } = req.body;
        // Mock simulation
        const result = yield (0, aiService_1.translateText)(text, sourceLang, targetLang);
        // Save to segment if provided
        if (segmentId) {
            const segment = yield Segment_1.Segment.findById(segmentId);
            if (segment) {
                segment.aiSuggestion = result;
                yield segment.save();
            }
        }
        res.json({ translatedText: result });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.translateSegment = translateSegment;
