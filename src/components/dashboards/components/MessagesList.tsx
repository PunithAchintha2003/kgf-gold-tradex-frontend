import React from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../ui/avatar';
import { MessageCircle, Send } from 'lucide-react';
import { formatTimestamp } from '../../../utils/dashboardUtils';

interface Message {
  id: string | number;
  sender?: string;
  content?: string;
  timestamp: string;
  seller: string;
  avatar?: string;
  unread?: boolean;
  lastMessage?: string;
}

interface MessagesListProps {
  messages: Message[];
  onOpenChat: () => void;
}

export const MessagesList: React.FC<MessagesListProps> = ({ messages, onOpenChat }) => {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Card key={message.id} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={message.avatar} alt={message.seller || 'User'} />
                <AvatarFallback>{(message.seller || 'U').slice(0, 2)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold truncate">{message.seller || 'Unknown'}</h4>
                  <div className="flex items-center space-x-2">
                    {message.unread && (
                      <Badge className="bg-red-500 text-white">New</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground truncate mb-3">
                  {message.lastMessage || message.content || 'No message'}
                </p>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={onOpenChat}
                  className="w-full"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Open Chat
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Start a Conversation</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Contact sellers about products or orders
          </p>
          <Button onClick={onOpenChat} className="kgf-gradient text-white">
            <Send className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};