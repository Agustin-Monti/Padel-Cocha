"use client";

import React from 'react';

export default function Collage() {
    return (
        <section className="py-12 px-4 bg-gray-100">
          <div className="">
            <img
              src="/collage.png"
              alt="Imagen Grande"
              className="w-full h-auto rounded-lg object-cover"
            />
          </div>
        </section>
      );
}
