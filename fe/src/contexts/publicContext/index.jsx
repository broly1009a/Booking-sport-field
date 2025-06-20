import React, { createContext, useState, useEffect } from 'react';
import typeService from '../../services/api/typeService';
import sportFieldService from '../../services/api/sportFieldService';

export const PublicContext = createContext();

export const PublicProvider = ({ children }) => {
    const [types, setTypes] = useState([]);
    const [sportFields, setSportFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ refresh, setRefresh ] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [typesData, sportFieldsData] = await Promise.all([
                    typeService.getAllTypes(),
                    sportFieldService.getAllSportFields()
                ]);
                setTypes(typesData || []);
                setSportFields(sportFieldsData || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }
    , [refresh]);
    const refreshData = () => {
        setRefresh(prev => !prev);
    } 
    if (loading) {
        return <div>Loading...</div>;
    }
    return (
        <PublicContext.Provider value={{ types, setTypes, sportFields, setSportFields, refreshData }}>
            {children}
        </PublicContext.Provider>
    );
}