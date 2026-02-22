import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout';
import AdminMenu from '../../components/AdminMenu';
import axios from 'axios';

const Users = () => {
  const [users, setUsers] = useState([]);

  const getUsers = async () => {
    try {
      const { data } = await axios.get('/api/v1/auth/users');
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <Layout title={"Dashboard - All Users"}>
        <div className="container-fluid m-3 p-3">
       <div className="row">
          <div className="col-md-3">
            <AdminMenu />
           </div>
           <div className="col-md-9">
             <h1>All Users</h1>
             <div>
               {users.length === 0 ? (
                 <p>No users</p>
               ) : (
                 <table className="table">
                   <thead>
                     <tr>
                       <th>#</th>
                       <th>Name</th>
                       <th>Email</th>
                       <th>Phone</th>
                       <th>Address</th>
                       <th>Role</th>
                     </tr>
                   </thead>
                   <tbody>
                     {users.map((u, i) => (
                       <tr key={u._id || i}>
                         <td>{i + 1}</td>
                         <td>{u.name}</td>
                         <td>{u.email}</td>
                         <td>{u.phone}</td>
                         <td>{typeof u.address === 'string' ? u.address : JSON.stringify(u.address)}</td>
                         <td>{u.role === 1 ? 'Admin' : 'User'}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               )}
             </div>
            </div>
        </div>
        </div> 
    </Layout>
  );
};

export default Users;