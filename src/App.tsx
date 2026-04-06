/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">Módulo de Pacientes en construcción...</div>} />
          <Route path="schedule" element={<div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">Módulo de Agenda en construcción...</div>} />
          <Route path="audit" element={<div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">Módulo de Auditoría en construcción...</div>} />
          <Route path="settings" element={<div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">Módulo de Configuración en construcción...</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

