import Button from '@mui/material/Button';
import { IoIosSearch } from "react-icons/io";
import { fetchDataFromApi } from '../../../utils/api';
import { useContext, useState, useRef, useEffect } from 'react';
import { MyContext } from '../../../App';
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { IoMdArrowForward } from "react-icons/io"; // Example for navigation

const SearchBox = (props) => {
    const [searchFields, setSearchFields] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    
    const context = useContext(MyContext);
    const history = useNavigate();
    const suggestionsRef = useRef(null); // Create a ref for the suggestions box

    const fetchSuggestions = async (query) => {
        if (query !== "") {
            setIsLoading(true);
            fetchDataFromApi(`/api/search?q=${query}`).then((res) => {
                setSuggestions(res.slice(0, 5)); // Limit to 5 suggestions
                setIsLoading(false);
            });
        } else {
            setSuggestions([]);
        }
    };

    const onChangeValue = (e) => {
        const value = e.target.value;
        setSearchFields(value);
        fetchSuggestions(value);  
    }

    const searchProducts = () => {
        if (searchFields !== "") {
            setIsLoading(true);
            fetchDataFromApi(`/api/search?q=${searchFields}`).then((res) => {
                context.setSearchData(res);
                setTimeout(() => {
                    setIsLoading(false);
                }, 2000);
                setSuggestions([]);  // Close the suggestion box after search
                props.closeSearch();
                history("/search");
            });
        }
    };

    const handleSuggestionClick = (item) => {
        context.setSearchData([item]);
        setSuggestions([]);  // Hide suggestions
        props.closeSearch();  // Close the search modal (if you have it)
        history(`/product/${item.id}`);  // Redirect to product details page
    };

    // Close suggestions box on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setSuggestions([]);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className='headerSearch ml-3 mr-3' style={{ position: 'relative' }}>
            <input
                type='text'
                placeholder='Search for products...'
                value={searchFields}
                onChange={onChangeValue}
                style={{
                    width: '300px',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                    fontSize: '16px',
                }}
            />
            <Button onClick={searchProducts} style={{ marginLeft: '10px' }}>
                {isLoading ? <CircularProgress size={20} /> : <IoIosSearch size={24} />}
            </Button>

            {suggestions.length > 0 && (
                <div
                    ref={suggestionsRef} // Attach the ref here
                    style={{
                        position: 'absolute',
                        top: '60px',
                        width: '100%',
                        backgroundColor: '#fff',
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                        borderRadius: '4px',
                        zIndex: 1000,
                        maxHeight: '200px', // Limit the height for scrolling
                        overflowY: 'auto',   // Enable scroll if content exceeds height
                    }}
                >
                    <List>
                        {suggestions.map((item, index) => (
                            <ListItem
                                key={index}
                                button
                                onClick={() => handleSuggestionClick(item)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '10px',
                                    borderBottom: '1px solid #f0f0f0',
                                    cursor: 'pointer',
                                }}
                            >
                                <ListItemText
                                    primary={item.name}
                                    secondary={item.category}
                                    style={{
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '200px',
                                    }}
                                />
                                <IoMdArrowForward size={20} style={{ marginLeft: 'auto', color: '#888' }} />
                            </ListItem>
                        ))}
                    </List>
                </div>
            )}
        </div>
    );
};

export default SearchBox;
