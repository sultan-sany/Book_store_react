import { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddTodo from './AddTodo';
import './App.css';

ModuleRegistry.registerModules([AllCommunityModule]);

// ✅ Replace this with your own Firebase Realtime Database URL (no trailing slash)
const FIREBASE_DB_URL = 'https://bookstore-8be67-default-rtdb.firebaseio.com';

function App() {
  const [books, setBooks] = useState([]);

  const [colDefs] = useState([
    { field: 'title', sortable: true, filter: true, flex: 1 },
    { field: 'author', sortable: true, filter: true, flex: 1 },
    { field: 'year', sortable: true, filter: true, width: 120 },
    { field: 'isbn', sortable: true, filter: true, flex: 1 },
    { field: 'price', sortable: true, filter: true, width: 120 },
    {
      headerName: '',
      field: 'id',
      width: 90,
      cellRenderer: (params) => (
        <IconButton onClick={() => deleteBook(params.value)} size="small" color="error">
          <DeleteIcon />
        </IconButton>
      )
    }
  ]);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = () => {
    fetch(`${FIREBASE_DB_URL}/books.json`)
      .then((response) => response.json())
      .then((data) => addKeys(data))
      .catch((err) => console.error(err));
  };

  // Firebase returns an object keyed by id; convert it to an array and add "id"
  const addKeys = (data) => {
    if (!data) {
      setBooks([]);
      return;
    }

    const keys = Object.keys(data);
    const values = Object.values(data).map((item, index) => ({
      ...item,
      id: keys[index]
    }));

    setBooks(values);
  };

  const addBook = (newBook) => {
    fetch(`${FIREBASE_DB_URL}/books.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBook)
    })
      .then(() => fetchBooks())
      .catch((err) => console.error(err));
  };

  const deleteBook = (id) => {
    fetch(`${FIREBASE_DB_URL}/books/${id}.json`, {
      method: 'DELETE'
    })
      .then(() => fetchBooks())
      .catch((err) => console.error(err));
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h5">Bookstore</Typography>
        </Toolbar>
      </AppBar>

      <AddTodo addBook={addBook} />

      <div style={{ height: 500, width: 900, margin: 12 }}>
        <AgGridReact rowData={books} columnDefs={colDefs} />
      </div>
    </>
  );
}

export default App;
