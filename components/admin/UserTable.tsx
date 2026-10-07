'use client';
import React, { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";


type User = {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  designation: string;
  role: string;
  access: string;
  status: {
    isActive: boolean;
  };
  createdAt: string;
};

type UserTableProps = {
  users: User[];
  onStatusToggle: (id: string) => void;
  onDelete?: (index: number) => void;
  onEdit?: (index: number, updatedUser: User) => void;
  userStatus: string
};

const UserTable: React.FC<UserTableProps> = ({ users, onStatusToggle}) => {


  return (
    <>
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="text-gray-900 font-semibold">Name</TableHead>
                <TableHead className="text-gray-900 font-semibold">Email</TableHead>
                <TableHead className="text-gray-900 font-semibold">Mobile No</TableHead>
                <TableHead className="text-gray-900 font-semibold">Access</TableHead>
                <TableHead className="text-gray-900 font-semibold">Created Date</TableHead>
                <TableHead className="text-gray-900 font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user?._id} className="border-b border-gray-200 hover:bg-gray-50/50">
                  <TableCell className="text-gray-900">{user.name}</TableCell>
                  <TableCell className="text-gray-600">{user.email}</TableCell>
                  <TableCell className="text-gray-600">{user.mobile}</TableCell>
                  <TableCell className="text-gray-600">{user.role}</TableCell>
                  <TableCell className="text-gray-600">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    }) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.status.isActive}
                        onCheckedChange={() => onStatusToggle(user._id)}
                        className="data-[state=checked]:bg-brand-primary"
                      />
                      <Label className={`text-sm font-medium ${
                        user.status.isActive ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {user.status.isActive ? 'Active' : 'Inactive'}
                      </Label>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default UserTable;
