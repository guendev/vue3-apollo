/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Address = {
  __typename?: 'Address';
  city?: Maybe<Scalars['String']['output']>;
  geo?: Maybe<Geo>;
  street?: Maybe<Scalars['String']['output']>;
  suite?: Maybe<Scalars['String']['output']>;
  zipcode?: Maybe<Scalars['String']['output']>;
};

export type Album = {
  __typename?: 'Album';
  id: Scalars['Int']['output'];
  photos?: Maybe<Array<Maybe<Photo>>>;
  title?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
};


export type AlbumPhotosArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type Comment = {
  __typename?: 'Comment';
  body?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  name?: Maybe<Scalars['String']['output']>;
  post?: Maybe<Post>;
};

export type Company = {
  __typename?: 'Company';
  bs?: Maybe<Scalars['String']['output']>;
  catchPhrase?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type CreatePostInput = {
  body: Scalars['String']['input'];
  title: Scalars['String']['input'];
  userId: Scalars['Int']['input'];
};

export type Geo = {
  __typename?: 'Geo';
  lat?: Maybe<Scalars['String']['output']>;
  lng?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createPost?: Maybe<Post>;
  deletePost?: Maybe<Scalars['String']['output']>;
  updatePost?: Maybe<Post>;
};


export type MutationCreatePostArgs = {
  post: CreatePostInput;
};


export type MutationDeletePostArgs = {
  postId: Scalars['Int']['input'];
};


export type MutationUpdatePostArgs = {
  post: UpdatePostInput;
  postId: Scalars['Int']['input'];
};

export type Photo = {
  __typename?: 'Photo';
  album?: Maybe<Album>;
  id: Scalars['Int']['output'];
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type Post = {
  __typename?: 'Post';
  body?: Maybe<Scalars['String']['output']>;
  comments?: Maybe<Array<Maybe<Comment>>>;
  id: Scalars['Int']['output'];
  title?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
};


export type PostCommentsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type Query = {
  __typename?: 'Query';
  albums?: Maybe<Array<Maybe<Album>>>;
  comments?: Maybe<Array<Maybe<Comment>>>;
  photos?: Maybe<Array<Maybe<Photo>>>;
  posts?: Maybe<Array<Maybe<Post>>>;
  todos?: Maybe<Array<Maybe<Todo>>>;
  userById?: Maybe<User>;
  users?: Maybe<Array<Maybe<User>>>;
};


export type QueryAlbumsArgs = {
  albumId?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  userId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCommentsArgs = {
  commentId?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  postId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPhotosArgs = {
  albumId?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  photoId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPostsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  postId?: InputMaybe<Scalars['Int']['input']>;
  userId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryTodosArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  todoId?: InputMaybe<Scalars['Int']['input']>;
  userId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryUserByIdArgs = {
  id: Scalars['Int']['input'];
};


export type QueryUsersArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  userId?: InputMaybe<Scalars['Int']['input']>;
};

export type Todo = {
  __typename?: 'Todo';
  completed?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['Int']['output'];
  title?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
};

export type UpdatePostInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['Int']['input']>;
};

export type User = {
  __typename?: 'User';
  address?: Maybe<Address>;
  albums?: Maybe<Array<Maybe<Album>>>;
  company?: Maybe<Company>;
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  name?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  posts?: Maybe<Array<Maybe<Post>>>;
  todos?: Maybe<Array<Maybe<Todo>>>;
  username?: Maybe<Scalars['String']['output']>;
  website?: Maybe<Scalars['String']['output']>;
};


export type UserAlbumsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type UserPostsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type UserTodosArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdatePostMutationVariables = Exact<{
  postId: Scalars['Int']['input'];
  post: UpdatePostInput;
}>;


export type UpdatePostMutation = { __typename?: 'Mutation', updatePost?: { __typename?: 'Post', id: number, title?: string | null } | null };

export type UserByIdQueryVariables = Exact<{
  userByIdId: Scalars['Int']['input'];
}>;


export type UserByIdQuery = { __typename?: 'Query', userById?: { __typename?: 'User', id: number, name?: string | null, email?: string | null } | null };

export type PostsQueryVariables = Exact<{
  userId?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type PostsQuery = { __typename?: 'Query', posts?: Array<{ __typename?: 'Post', id: number, title?: string | null } | null> | null };


export const UpdatePostDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePost"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"postId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"post"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdatePostInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePost"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"postId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"postId"}}},{"kind":"Argument","name":{"kind":"Name","value":"post"},"value":{"kind":"Variable","name":{"kind":"Name","value":"post"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]} as unknown as DocumentNode<UpdatePostMutation, UpdatePostMutationVariables>;
export const UserByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userByIdId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userByIdId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<UserByIdQuery, UserByIdQueryVariables>;
export const PostsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Posts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"posts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]} as unknown as DocumentNode<PostsQuery, PostsQueryVariables>;