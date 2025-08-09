import React, { useState, useEffect } from "react";
import { Box, Collapse, IconButton, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { ExpandLess,ExpandMore } from "@mui/icons-material";
import { policyService } from "../../services/api/policyService";
import Footer from "../../components/footers/footers";

const Policy = () => {
    const [policy, setPolicy] = useState({});
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState({});

    useEffect(() => {
        const fetchPolicies = async () => {
            setLoading(true);
            try {
                const res = await policyService.getPolicies();
                const list = Array.isArray(res) ? res : res.data;

                const grouped = list.reduce((acc, item) => {
                    const category = item.categoryPolicyId?.title || "Khác";
                    if (!acc[category]) acc[category] = [];
                    acc[category].push({
                        policyId: item._id,
                        content: item.content
                    });
                    return acc;
                }, {});

                setPolicy(grouped);
            } catch (error) {
                console.error("Error fetching policies:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPolicies();
    }, []);

    const toggleExpand = (category) => {
        setExpanded(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    return (
        <>
            <Box sx={{ p: 4, bgcolor: '#f5f5f5' }}>
                <Typography variant="h4" sx={{ mb: 3, color: '#388e3c' }}>
                    Chính sách pháp lý
                </Typography>

                {loading ? (
                    <Typography>Đang tải...</Typography>
                ) : Object.keys(policy).length === 0 ? (
                    <Typography>Không có chính sách</Typography>
                ) : (
                    Object.entries(policy).map(([category, items]) => (
                        <Box key={category} sx={{ mb: 5 }}>
                            <Box
                                onClick={() => toggleExpand(category)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    mb: 1
                                }}
                            >
                                <Typography variant="h6" sx={{ color: '#1976d2' }}>
                                    {category}
                                </Typography>
                                <IconButton sx={{ color: '#1976d2', ml: 1 }}>
                                    {expanded[category] ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                            </Box>

                            <Collapse in={expanded[category]}>
                                {items.map(policy => (
                                    <Box key={policy.policyId} sx={{ mb: 2 }}>
                                        <Typography variant="body2">{policy.content}</Typography>
                                    </Box>
                                ))}
                            </Collapse>
                        </Box>
                    ))
                )}
            </Box>

            <Footer />
        </>
    );
};

export default Policy;