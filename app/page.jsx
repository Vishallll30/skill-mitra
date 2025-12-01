"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function SkillMitra() {
  // Fetch posts from Convex
  const posts = useQuery(api.posts.list) || [];

  return (
    <div className="p-4">
      {posts.length > 0 ? (
        posts.map((post, i) => (
          <div
            key={post._id?.toString() ?? i}
            className="flex items-center justify-between pt-2 border-t"
          >
            <div className="flex items-center space-x-4">
              <p>{post?.text ?? ""}</p>
            </div>
          </div>
        ))
      ) : (
        <p>No posts available</p>
      )}
    </div>
  );
}
