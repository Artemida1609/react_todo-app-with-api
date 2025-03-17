import React from 'react';
import { TodoItem } from './TodoItem';
import { Todo } from '../types/Todo';

type Props = {
  todos: Todo[];
  setTodos: (arg: Todo[]) => void;
  allTodos: Todo[];
  setAllTodos: (arg: Todo[]) => void;
  setErrorMessage: (arg: string) => void;
  loadingTodoId: number[];
  setLoadingTodoId: (arg: number[]) => void;
};

export const TodoList: React.FC<Props> = ({
  todos,
  allTodos,
  setTodos,
  setAllTodos,
  setErrorMessage,
  loadingTodoId,
  setLoadingTodoId,
}) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          setTodos={setTodos}
          allTodos={allTodos}
          setAllTodos={setAllTodos}
          setErrorMessage={setErrorMessage}
          loadingTodoId={loadingTodoId}
          setLoadingTodoId={setLoadingTodoId}
        />
      ))}
    </section>
  );
};
