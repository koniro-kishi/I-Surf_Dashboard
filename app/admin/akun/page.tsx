"use client";

import CreateUserForm from "../../../components/create-user-form";
import UserList from "../../../components/user-list";

export default function AdminAkunPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Kelola akun</h1>
      <div className="grid gap-4 md:grid-cols-[minmax(0,22rem)_1fr] md:items-start">
        <CreateUserForm />
        <UserList />
      </div>
    </>
  );
}
