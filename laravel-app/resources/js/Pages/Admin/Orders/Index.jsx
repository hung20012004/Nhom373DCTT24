import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/Components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/Components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/Components/ui/select';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Order Status Colors and Mapping
const ORDER_STATUSES = {
    pending: {
        color: 'bg-yellow-100 text-yellow-800',
        label: 'Pending'
    },
    processing: {
        color: 'bg-blue-100 text-blue-800',
        label: 'Processing'
    },
    shipped: {
        color: 'bg-green-100 text-green-800',
        label: 'Shipped'
    },
    delivered: {
        color: 'bg-purple-100 text-purple-800',
        label: 'Delivered'
    },
    cancelled: {
        color: 'bg-red-100 text-red-800',
        label: 'Cancelled'
    }
};

export default function OrderManagement() {
    const [orders, setOrders] = useState({
        pending: [],
        processing: [],
        shipped: [],
        delivered: [],
        cancelled: []
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchOrders = async () => {
        try {
            const response = await axios.get('/api/v1/orders', {
                params: {
                    search: searchTerm,
                    with: 'user,order_details.product'
                }
            });

            // Group orders by status
            const groupedOrders = response.data.reduce((acc, order) => {
                const status = order.status.toLowerCase();
                if (acc[status]) {
                    acc[status].push(order);
                }
                return acc;
            }, {
                pending: [],
                processing: [],
                shipped: [],
                delivered: [],
                cancelled: []
            });

            setOrders(groupedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [searchTerm]);

    const handleDragEnd = async (result) => {
        const { source, destination } = result;
        if (!destination) return;

        const sourceStatus = source.droppableId;
        const destStatus = destination.droppableId;
        const draggedOrder = orders[sourceStatus][source.index];

        // Optimistic update
        const newOrders = { ...orders };
        newOrders[sourceStatus].splice(source.index, 1);
        newOrders[destStatus].splice(destination.index, 0, draggedOrder);
        setOrders(newOrders);

        // Update order status on backend
        try {
            await axios.patch(`/api/v1/orders/${draggedOrder.id}`, {
                status: destStatus
            });
        } catch (error) {
            console.error('Error updating order status:', error);
            // Revert changes if API call fails
            setOrders(orders);
        }
    };

    const renderOrderCard = (order, index) => {
        const status = order.status.toLowerCase();
        return (
            <Draggable key={order.id} draggableId={order.id.toString()} index={index}>
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="mb-2 p-3 bg-white border rounded shadow-sm"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="font-bold">Order #{order.id}</div>
                                <div className="text-sm text-gray-600">
                                    {order.user?.full_name || 'Unknown Customer'}
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${ORDER_STATUSES[status].color}`}>
                                {ORDER_STATUSES[status].label}
                            </span>
                        </div>
                        <div className="mt-2 text-sm">
                            Total: ${order.total.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {new Date(order.created_at).toLocaleDateString()}
                        </div>
                    </div>
                )}
            </Draggable>
        );
    };

    const renderKanbanColumn = (status) => (
        <Droppable droppableId={status}>
            {(provided) => (
                <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="bg-gray-100 p-3 rounded-lg min-h-[500px]"
                >
                    <div className="font-bold mb-3 text-center">
                        {ORDER_STATUSES[status].label} Orders
                    </div>
                    {orders[status].map((order, index) => renderOrderCard(order, index))}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    );

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Order Management</h1>
                <div className="flex space-x-4">
                    <Input
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                    />
                </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-5 gap-4">
                    {Object.keys(ORDER_STATUSES).map(status => renderKanbanColumn(status))}
                </div>
            </DragDropContext>
        </div>
    );
}
