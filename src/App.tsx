import { Route, Routes } from 'react-router-dom';
import { Shell } from '@/components/shell/Shell';
import { ShellProvider } from '@/components/shell/shell-context';
import { Chat } from '@/pages/chat/Chat';
import { Conversations } from '@/pages/conversations/Conversations';
import { Home } from '@/pages/home/Home';

export function App() {
  return (
    <ShellProvider>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Home />} />
          <Route path="chat/:id?" element={<Chat />} />
          <Route path="conversations" element={<Conversations />} />
        </Route>
      </Routes>
    </ShellProvider>
  );
}
