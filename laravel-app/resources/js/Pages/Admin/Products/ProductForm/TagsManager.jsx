import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { X, Plus } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';

const TagsManager = ({ selectedTags, setSelectedTags, tags }) => {
    const [newTagId, setNewTagId] = useState('');

    // Add a tag to the product
    const handleAddTag = () => {
        if (newTagId && !selectedTags.includes(parseInt(newTagId))) {
            setSelectedTags(prev => [...prev, parseInt(newTagId)]);
            setNewTagId('');
        }
    };

    // Remove a tag from the product
    const handleRemoveTag = (tagId) => {
        setSelectedTags(prev => prev.filter(id => id !== tagId));
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Thẻ tag</h3>
            <div className="flex flex-wrap gap-2">
                {selectedTags.map(tagId => {
                    const tag = tags.find(t => t.id === tagId);
                    return tag ? (
                        <Badge key={tag.id} className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                            {tag.name}
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="ml-1 p-0 h-4 w-4"
                                onClick={() => handleRemoveTag(tag.id)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    ) : null;
                })}
            </div>

            <div className="flex gap-2">
                <Select
                    value={newTagId}
                    onValueChange={setNewTagId}
                >
                    <SelectTrigger className="flex-grow">
                        <SelectValue placeholder="Chọn tag" />
                    </SelectTrigger>
                    <SelectContent>
                        {tags
                            .filter(tag => !selectedTags.includes(tag.id))
                            .map(tag => (
                                <SelectItem key={tag.id} value={tag.id.toString()}>
                                    {tag.name}
                                </SelectItem>
                            ))}
                    </SelectContent>
                </Select>
                <Button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!newTagId}
                >
                    <Plus className="h-4 w-4 mr-1" /> Thêm Tag
                </Button>
            </div>
        </div>
    );
};

export default TagsManager;
