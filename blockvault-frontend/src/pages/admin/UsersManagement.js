
import React, { useState } from 'react';
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  CheckCircle,
  XCircle,
  Shield,
  ShieldCheck,
  Edit2,
  Trash2,
  Check,
  X,
  Mail,
  Building,
} from 'lucide-react';

const initialUsers = [
  {
    id: 'USR-001',
    name: 'Dr. Priya Mehta',
    email: 'principal@govpolytechnic.edu',
    role: 'Principal',
    department: 'Administration',
    status: 'Active',
    joinedDate: '2023-08-10',
    avatarLetter: 'P',
  },
  {
    id: 'USR-002',
    name: 'Prof. Ramesh Kumar',
    email: 'ramesh.kumar@govpolytechnic.edu',
    role: 'HOD',
    department: 'Computer Science Department',
    status: 'Active',
    joinedDate: '2023-09-15',
    avatarLetter: 'R',
  },
  {
    id: 'USR-003',
    name: 'Mr. Rajesh Verma',
    email: 'rajesh.verma@govpolytechnic.edu',
    role: 'Class Teacher',
    department: 'Computer Science Department',
    status: 'Active',
    joinedDate: '2023-11-20',
    avatarLetter: 'R',
  },
];

const roleBadges = {
  'Principal': 'bg-purple-100 text-purple-800 border-purple-200',
  'HOD': 'bg-blue-100 text-blue-800 border-blue-200',
  'Class Teacher': 'bg-green-100 text-green-800 border-green-200',
};

export default function UsersManagement() {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [toast, setToast] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Class Teacher',
    department: '',
    status: 'Active',
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const newUser = {
      id: `USR-${String(users.length + 1).padStart(3, '0')}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      department: formData.department || 'General Administration',
      status: formData.status,
      joinedDate: new Date().toISOString().split('T')[0],
      avatarLetter: formData.name.charAt(0).toUpperCase(),
    };

    setUsers([newUser, ...users]);
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      email: '',
      role: 'Class Teacher',
      department: '',
      status: 'Active',
    });
    showToast(`User ${newUser.name} created successfully.`);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ...formData } : u))
    );
    setIsEditModalOpen(false);
    showToast(`User ${formData.name} updated successfully.`);
  };

  const openEditModal = (user) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      status: user.status,
    });
    setIsEditModalOpen(true);
  };

  const toggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === 'Active' ? 'Inactive' : 'Active';
          showToast(`Status updated to ${nextStatus} for ${u.name}.`);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const deleteUser = (id) => {
    const userToDelete = users.find((u) => u.id === id);
    if (userToDelete?.role === 'Principal') {
      showToast('The Principal account cannot be deleted.', 'error');
      return;
    }

    if (window.confirm(`Are you sure you want to remove user ${userToDelete?.name}?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast(`User ${userToDelete?.name} removed successfully.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium transition-all ${
            toast.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-[#1F3D2B] text-white'
          }`}
        >
          {toast.type === 'error' ? <XCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-3xl font-bold text-[#1A1A1A]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Users & Roles Management
          </h1>
          <p className="text-gray-500 mt-1">
            Configure administrative accounts, credential issuers, and role-based permissions.
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({
              name: '',
              email: '',
              role: 'Class Teacher',
              department: '',
              status: 'Active',
            });
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1F3D2B] text-white rounded-full font-medium text-sm hover:bg-[#16281C] transition-colors shadow-sm cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Users</p>
              <p className="text-2xl font-bold text-[#1A1A1A] mt-1">{users.length}</p>
            </div>
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
              <UsersIcon className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Active Users</p>
              <p className="text-2xl font-bold text-[#1A1A1A] mt-1">
                {users.filter((u) => u.status === 'Active').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Inactive / Other Status</p>
              <p className="text-2xl font-bold text-[#1A1A1A] mt-1">
                {users.filter((u) => u.status !== 'Active').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Institutional Roles</p>
              <p className="text-2xl font-bold text-[#1A1A1A] mt-1">
                {new Set(users.map((u) => u.role)).size}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, department, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3D2B] focus:border-transparent"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3D2B] focus:border-transparent"
        >
          <option value="All">All Roles</option>
          <option value="Principal">Principal</option>
          <option value="HOD">HOD</option>
          <option value="Class Teacher">Class Teacher</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3D2B] focus:border-transparent"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined Date</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-cream border border-brand-beige flex items-center justify-center font-bold text-[#1F3D2B] text-sm flex-shrink-0">
                          {user.avatarLetter}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1A1A1A]">{user.name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          roleBadges[user.role] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-gray-400" />
                        {user.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.joinedDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.status === 'Active' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleStatus(user.id)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors text-gray-700 cursor-pointer"
                          title={user.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 text-gray-500 hover:text-[#1F3D2B] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {user.role !== 'Principal' && (
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add User */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-bold text-lg text-brand-charcoal">Add New User</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prof. Alan Walker"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3D2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. teacher@govpolytechnic.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3D2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3D2B] bg-white"
                >
                  <option value="Class Teacher">Class Teacher</option>
                  <option value="HOD">HOD</option>
                  <option value="Principal">Principal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Department</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Engineering Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3D2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Account Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3D2B] bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#1F3D2B] text-white rounded-xl text-sm font-medium hover:bg-[#16281C]"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {isEditModalOpen && currentUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-bold text-lg text-brand-charcoal">Edit User Details</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3D2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3D2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3D2B] bg-white"
                >
                  <option value="Class Teacher">Class Teacher</option>
                  <option value="HOD">HOD</option>
                  <option value="Principal">Principal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3D2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Account Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3D2B] bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#1F3D2B] text-white rounded-xl text-sm font-medium hover:bg-[#16281C]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
