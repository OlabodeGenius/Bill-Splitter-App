// Mark this component as a Client Component
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Define the form schema
const formSchema = z.object({
  billAmount: z.number().min(0, "Bill amount must be positive"),
  tipPercentage: z.number().min(0).max(100),
  people: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      percentage: z.number().min(0).max(100),
    })
  ).min(2, "At least two people are required"),
});

type FormValues = z.infer<typeof formSchema>;

const BillSplittingApp: React.FC = () => {
  const [savedSplits, setSavedSplits] = useState<FormValues[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      billAmount: 0,
      tipPercentage: 15,
      people: [
        { name: 'Person 1', percentage: 50 },
        { name: 'Person 2', percentage: 50 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "people",
  });


  const adjustPercentages = () => {
    const people = form.getValues().people;
    const totalPercentage = people.reduce((sum, person) => sum + person.percentage, 0);

    if (totalPercentage !== 100) {
      const lastPersonIndex = people.length - 1;
      const lastPerson = people[lastPersonIndex];
      const newPercentage = Math.max(0, 100 - (totalPercentage - lastPerson.percentage));
      form.setValue(`people.${lastPersonIndex}.percentage`, newPercentage);
    }
  };

  useEffect(() => {
    adjustPercentages();
  }, [fields]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log(data);
    setSavedSplits([...savedSplits, data]);
  };

  const addPerson = () => {
    append({ name: `Person ${fields.length + 1}`, percentage: 0 });
  };

  const removePerson = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  const calculateTotalWithTip = (billAmount: number, tipPercentage: number) => {
    return billAmount * (1 + tipPercentage / 100);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Bill Splitting App</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="billAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bill Amount</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tip Percentage: {field.value}%</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {fields.map((field, index) => (
              <div key={field.id} className="space-y-2">
                <FormField
                  control={form.control}
                  name={`people.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{`Person ${index + 1} Name`}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`people.${index}.percentage`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Percentage: {field.value}%</FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={100}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          onBlur={adjustPercentages}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {index > 1 && (
                  <Button type="button" variant="destructive" size="sm" onClick={() => removePerson(index)}>
                    Remove
                  </Button>
                )}

                <div>
                  Amount to pay: $
                  {((calculateTotalWithTip(form.getValues().billAmount, form.getValues().tipPercentage) * field.percentage) / 100).toFixed(2)}
                </div>
              </div>
            ))}

            <Button type="button" onClick={addPerson}>Add Person</Button>
            <Button type="submit">Save Split</Button>
          </form>
        </Form>

        <div className="mt-4">
          <h3 className="text-lg font-semibold">Saved Splits</h3>
          {savedSplits.map((split, index) => (
            <div key={index} className="mt-2">
              <Button onClick={() => form.reset(split)}>
                Load Split {index + 1}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BillSplittingApp;
