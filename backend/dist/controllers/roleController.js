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
exports.deleteRole = exports.updateRole = exports.createRole = exports.getAllRoles = void 0;
const Role_1 = require("../models/Role");
const getAllRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield Role_1.Role.find({});
        res.json(roles);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAllRoles = getAllRoles;
const createRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, permissions, description } = req.body;
        const existingRole = yield Role_1.Role.findOne({ name });
        if (existingRole) {
            return res.status(400).json({ message: 'Role already exists' });
        }
        const role = yield Role_1.Role.create({
            name,
            permissions,
            description
        });
        res.status(201).json(role);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.createRole = createRole;
const updateRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, permissions, description } = req.body;
        const role = yield Role_1.Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        if (role.name === 'SUPER_ADMIN') {
            return res.status(400).json({ message: 'Cannot modify Super Admin role' });
        }
        role.name = name || role.name;
        role.permissions = permissions || role.permissions;
        role.description = description || role.description;
        yield role.save();
        res.json(role);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.updateRole = updateRole;
const deleteRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const role = yield Role_1.Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        if (['SUPER_ADMIN', 'ADMIN', 'CLIENT', 'TRANSLATOR'].includes(role.name)) {
            return res.status(400).json({ message: 'Cannot delete default system roles' });
        }
        yield role.deleteOne();
        res.json({ message: 'Role deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteRole = deleteRole;
